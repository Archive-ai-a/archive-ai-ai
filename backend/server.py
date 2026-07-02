from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import uuid
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

from auth_utils import hash_password, verify_password, create_access_token, decode_token, extract_token

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class Tool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    tagline: str
    description: str
    category: str
    category_slugs: List[str] = []
    pricing: str
    url: str
    logo_url: Optional[str] = None
    use_cases: List[str] = []
    free_alternatives: List[str] = []
    best_prompts: List[str] = []
    pros: List[str] = []
    cons: List[str] = []
    professions: List[str] = []
    start_here_workflow: List[str] = []
    make_money_module: List[dict] = []
    irl_use_cases: List[str] = []
    featured: bool = False
    trending: bool = False
    new_launch: bool = False
    updated_recently: bool = False
    view_count: int = 0
    created_at: str = Field(default_factory=now_iso)


class ToolIn(BaseModel):
    name: str
    slug: str
    tagline: str
    description: str
    category: Optional[str] = None
    category_slugs: List[str] = []
    pricing: str
    url: str
    logo_url: Optional[str] = None
    use_cases: List[str] = []
    free_alternatives: List[str] = []
    best_prompts: List[str] = []
    pros: List[str] = []
    cons: List[str] = []
    professions: List[str] = []
    start_here_workflow: List[str] = []
    make_money_module: List[dict] = []
    irl_use_cases: List[str] = []
    featured: bool = False
    trending: bool = False
    new_launch: bool = False
    updated_recently: bool = False


class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    icon: str
    parent_slug: Optional[str] = None
    sort: int = 100


class CategoryIn(BaseModel):
    name: str
    slug: str
    description: str = ""
    icon: str = "Sparkles"
    parent_slug: Optional[str] = None
    sort: int = 100


class CareerPack(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    profession: str
    tool_slugs: List[str] = []
    workflow_steps: List[dict] = []
    image_url: str


class CareerPackIn(BaseModel):
    name: str
    slug: str
    description: str
    profession: str
    tool_slugs: List[str] = []
    workflow_steps: List[dict] = []
    image_url: str = ""


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str  # super_admin | admin | user
    created_at: str
    last_login_at: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AdminCreateIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = "Admin"
    role: str = "admin"  # admin | super_admin


class PasswordResetIn(BaseModel):
    email: EmailStr
    new_password: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class BulkImportIn(BaseModel):
    tools: List[dict]
    overwrite: bool = False


# ---------- Auth ----------
async def _get_user_by_id(uid: str):
    return await db.users.find_one({"id": uid}, {"_id": 0})


async def current_user(request: Request) -> Optional[dict]:
    token = extract_token(request)
    if not token:
        return None
    try:
        payload = decode_token(token)
    except Exception:
        return None
    user = await _get_user_by_id(payload.get("sub"))
    if user:
        user.pop("password_hash", None)
    return user


async def require_user(request: Request):
    user = await current_user(request)
    if not user:
        raise HTTPException(401, "Auth required")
    return user


async def require_admin(request: Request):
    user = await current_user(request)
    if not user or user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(401, "Admin auth required")
    return user


async def require_super_admin(request: Request):
    user = await current_user(request)
    if not user or user.get("role") != "super_admin":
        raise HTTPException(403, "Super admin required")
    return user


@api_router.post("/auth/login")
async def login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.lower().strip()
    key = f"email:{email}"
    # Rate limit: 5 failed attempts / 15 min per email
    now = datetime.now(timezone.utc)
    rec = await db.login_attempts.find_one({"key": key})
    if rec and rec.get("locked_until") and rec["locked_until"] > now.isoformat():
        raise HTTPException(429, "Too many failed attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        # increment failed attempts
        fails = (rec or {}).get("fails", 0) + 1
        upd = {"fails": fails, "last_at": now.isoformat()}
        if fails >= 5:
            upd["locked_until"] = (now + timedelta(minutes=15)).isoformat()
            upd["fails"] = 0
        await db.login_attempts.update_one({"key": key}, {"$set": upd}, upsert=True)
        raise HTTPException(401, "Invalid email or password")

    # Success — clear attempts
    await db.login_attempts.delete_one({"key": key})
    token = create_access_token(user["id"], user["email"], user["role"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=False, samesite="lax",
        max_age=60 * 60 * 24 * 7, path="/",
    )
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login_at": now_iso()}})
    return {"token": token, "user": {k: v for k, v in user.items() if k not in ("_id", "password_hash")}}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(request: Request):
    user = await current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if len(payload.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    exists = await db.users.find_one({"email": email})
    if exists:
        raise HTTPException(400, "Email already registered")
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": payload.name or email.split("@")[0],
        "role": "user",
        "password_hash": hash_password(payload.password),
        "bookmarks": [],
        "created_at": now_iso(),
        "last_login_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(doc["id"], doc["email"], doc["role"])
    response.set_cookie("access_token", token, httponly=True, secure=False, samesite="lax",
                        max_age=60 * 60 * 24 * 7, path="/")
    doc.pop("password_hash")
    doc.pop("_id", None)
    return {"token": token, "user": doc}


# ---------- Bookmarks ----------
@api_router.get("/bookmarks")
async def get_bookmarks(user: dict = Depends(require_user)):
    slugs = user.get("bookmarks", [])
    if not slugs:
        return []
    docs = await db.tools.find({"slug": {"$in": slugs}}, {"_id": 0}).to_list(500)
    return docs


@api_router.post("/bookmarks/{slug}")
async def add_bookmark(slug: str, user: dict = Depends(require_user)):
    tool = await db.tools.find_one({"slug": slug})
    if not tool:
        raise HTTPException(404, "Tool not found")
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"bookmarks": slug}})
    return {"ok": True}


@api_router.delete("/bookmarks/{slug}")
async def remove_bookmark(slug: str, user: dict = Depends(require_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"bookmarks": slug}})
    return {"ok": True}


# ---------- Bulk import ----------
@api_router.post("/admin/bulk-import")
async def bulk_import(payload: BulkImportIn, _: dict = Depends(require_admin)):
    added = 0
    updated = 0
    skipped = 0
    for raw in payload.tools:
        try:
            data = ToolIn(**{**{"pricing": "freemium", "url": ""}, **raw}).model_dump()
        except Exception:
            skipped += 1
            continue
        existing = await db.tools.find_one({"slug": data["slug"]})
        if existing:
            if payload.overwrite:
                data["id"] = existing["id"]
                data["created_at"] = existing.get("created_at", now_iso())
                data["view_count"] = existing.get("view_count", 0)
                await db.tools.update_one({"slug": data["slug"]}, {"$set": data})
                updated += 1
            else:
                skipped += 1
        else:
            tool = Tool(**data)
            await db.tools.insert_one(tool.model_dump())
            added += 1
    return {"added": added, "updated": updated, "skipped": skipped}


@api_router.post("/admin/import-extras")
async def import_extras(_: dict = Depends(require_admin)):
    from extra_tools import build_extra_tools
    tools = build_extra_tools()
    existing_slugs = set()
    async for d in db.tools.find({}, {"_id": 0, "slug": 1}):
        existing_slugs.add(d["slug"])
    added = 0
    for t in tools:
        if t["slug"] in existing_slugs:
            continue
        await db.tools.insert_one(Tool(**t).model_dump())
        added += 1
    return {"added": added, "total_available": len(tools), "existing": len(existing_slugs)}


# ---------- Admin: admins
async def list_admins(_: dict = Depends(require_admin)):
    docs = await db.users.find(
        {"role": {"$in": ["admin", "super_admin"]}},
        {"_id": 0, "password_hash": 0}
    ).to_list(200)
    return docs


@api_router.post("/admin/admins")
async def create_admin(payload: AdminCreateIn, _: dict = Depends(require_super_admin)):
    email = payload.email.lower().strip()
    exists = await db.users.find_one({"email": email})
    if exists:
        raise HTTPException(400, "User already exists")
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": payload.name or "Admin",
        "role": payload.role if payload.role in ("admin", "super_admin") else "admin",
        "password_hash": hash_password(payload.password),
        "created_at": now_iso(),
        "last_login_at": None,
    }
    await db.users.insert_one(doc)
    doc.pop("password_hash", None)
    doc.pop("_id", None)
    return doc


@api_router.post("/admin/admins/reset-password")
async def reset_admin_password(payload: PasswordResetIn, _: dict = Depends(require_admin)):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    return {"ok": True}


@api_router.delete("/admin/admins/{admin_id}")
async def delete_admin(admin_id: str, current: dict = Depends(require_super_admin)):
    if current["id"] == admin_id:
        raise HTTPException(400, "Cannot delete yourself")
    r = await db.users.delete_one({"id": admin_id, "role": {"$in": ["admin", "super_admin"]}})
    if r.deleted_count == 0:
        raise HTTPException(404, "Admin not found")
    return {"ok": True}


# ---------- Tools ----------
@api_router.get("/tools")
async def list_tools(
    category: Optional[str] = None,
    pricing: Optional[str] = None,
    profession: Optional[str] = None,
    q: Optional[str] = None,
    featured: Optional[bool] = None,
    trending: Optional[bool] = None,
    new_launch: Optional[bool] = None,
    sort: str = "featured",
    limit: int = Query(500, le=1000),
):
    query = {}
    if category:
        query["$or"] = [{"category": category}, {"category_slugs": category}]
    if pricing:
        query["pricing"] = pricing
    if profession:
        query["professions"] = profession
    if featured is not None:
        query["featured"] = featured
    if trending is not None:
        query["trending"] = trending
    if new_launch is not None:
        query["new_launch"] = new_launch
    if q:
        query.setdefault("$or", []).extend([
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ])
    sort_key = {"views": [("view_count", -1)], "name": [("name", 1)]}.get(sort, [("featured", -1), ("trending", -1), ("view_count", -1)])
    docs = await db.tools.find(query, {"_id": 0}).sort(sort_key).limit(limit).to_list(limit)
    return docs


@api_router.get("/tools/{slug}")
async def get_tool(slug: str):
    doc = await db.tools.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Tool not found")
    # Increment view count
    await db.tools.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    await db.activity.insert_one({"type": "tool_view", "slug": slug, "ts": now_iso()})
    return doc


@api_router.post("/tools")
async def create_tool(payload: ToolIn, _: dict = Depends(require_admin)):
    existing = await db.tools.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(400, "Slug exists")
    data = payload.model_dump()
    if not data.get("category") and data.get("category_slugs"):
        data["category"] = data["category_slugs"][0]
    tool = Tool(**data)
    await db.tools.insert_one(tool.model_dump())
    return tool.model_dump()


@api_router.put("/tools/{slug}")
async def update_tool(slug: str, payload: ToolIn, _: dict = Depends(require_admin)):
    existing = await db.tools.find_one({"slug": slug}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Tool not found")
    data = payload.model_dump()
    data["id"] = existing["id"]
    data["created_at"] = existing.get("created_at", now_iso())
    data["view_count"] = existing.get("view_count", 0)
    await db.tools.update_one({"slug": slug}, {"$set": data})
    return data


@api_router.delete("/tools/{slug}")
async def delete_tool(slug: str, _: dict = Depends(require_admin)):
    r = await db.tools.delete_one({"slug": slug})
    if r.deleted_count == 0:
        raise HTTPException(404, "Tool not found")
    return {"ok": True}


# ---------- Categories ----------
@api_router.get("/categories")
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).sort([("sort", 1), ("name", 1)]).to_list(500)
    return docs


@api_router.post("/categories")
async def create_category(payload: CategoryIn, _: dict = Depends(require_admin)):
    exists = await db.categories.find_one({"slug": payload.slug})
    if exists:
        raise HTTPException(400, "Slug exists")
    doc = Category(**payload.model_dump()).model_dump()
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/categories/{slug}")
async def update_category(slug: str, payload: CategoryIn, _: dict = Depends(require_admin)):
    ex = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not ex:
        raise HTTPException(404, "Not found")
    data = payload.model_dump()
    data["id"] = ex["id"]
    await db.categories.update_one({"slug": slug}, {"$set": data})
    return data


@api_router.delete("/categories/{slug}")
async def delete_category(slug: str, _: dict = Depends(require_admin)):
    r = await db.categories.delete_one({"slug": slug})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- Career Packs ----------
@api_router.get("/career-packs")
async def list_packs():
    docs = await db.career_packs.find({}, {"_id": 0}).to_list(200)
    return docs


@api_router.get("/career-packs/{slug}")
async def get_pack(slug: str):
    doc = await db.career_packs.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc


@api_router.post("/career-packs")
async def create_pack(payload: CareerPackIn, _: dict = Depends(require_admin)):
    ex = await db.career_packs.find_one({"slug": payload.slug})
    if ex:
        raise HTTPException(400, "Slug exists")
    doc = CareerPack(**payload.model_dump()).model_dump()
    await db.career_packs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/career-packs/{slug}")
async def update_pack(slug: str, payload: CareerPackIn, _: dict = Depends(require_admin)):
    ex = await db.career_packs.find_one({"slug": slug}, {"_id": 0})
    if not ex:
        raise HTTPException(404, "Not found")
    data = payload.model_dump()
    data["id"] = ex["id"]
    await db.career_packs.update_one({"slug": slug}, {"$set": data})
    return data


@api_router.delete("/career-packs/{slug}")
async def delete_pack(slug: str, _: dict = Depends(require_admin)):
    r = await db.career_packs.delete_one({"slug": slug})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- FAQ / Roadmap ----------
@api_router.get("/faq")
async def get_faq():
    from seed_data import FAQ
    return FAQ


@api_router.get("/roadmap")
async def get_roadmap():
    from seed_data import ROADMAP
    return ROADMAP


# ---------- Users & Activity ----------
@api_router.get("/admin/users")
async def list_users(_: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return docs


@api_router.get("/admin/users/{uid}")
async def get_user(uid: str, _: dict = Depends(require_admin)):
    u = await db.users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})
    if not u:
        raise HTTPException(404, "Not found")
    activity = await db.activity.find({"user_id": uid}, {"_id": 0}).sort("ts", -1).limit(200).to_list(200)
    return {"user": u, "activity": activity}


@api_router.post("/activity/log")
async def log_activity(event: dict, request: Request):
    user = await current_user(request)
    event["user_id"] = user["id"] if user else None
    event["ts"] = now_iso()
    event.setdefault("type", "generic")
    await db.activity.insert_one(event)
    return {"ok": True}


@api_router.get("/admin/analytics")
async def analytics(_: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_tools = await db.tools.count_documents({})
    total_categories = await db.categories.count_documents({})
    total_packs = await db.career_packs.count_documents({})

    # DAU last 7 days
    from collections import Counter
    since = (datetime.now(timezone.utc) - _td(days=7)).isoformat()
    events = await db.activity.find({"ts": {"$gte": since}}, {"_id": 0}).to_list(5000)
    by_day = Counter()
    tool_views = Counter()
    category_views = Counter()
    for e in events:
        day = e["ts"][:10]
        by_day[day] += 1
        if e.get("type") == "tool_view":
            tool_views[e.get("slug", "")] += 1
        if e.get("type") == "category_view":
            category_views[e.get("slug", "")] += 1

    top_tools = tool_views.most_common(8)
    top_categories = category_views.most_common(8)

    # If no category views yet, fallback to top tools by view_count
    top_by_views = await db.tools.find({}, {"_id": 0, "name": 1, "slug": 1, "view_count": 1}).sort("view_count", -1).limit(8).to_list(8)

    daily_series = [{"day": d, "count": c} for d, c in sorted(by_day.items())]

    return {
        "totals": {"users": total_users, "tools": total_tools, "categories": total_categories, "career_packs": total_packs},
        "dau_series": daily_series,
        "top_tools": [{"slug": s, "views": v} for s, v in top_tools],
        "top_categories": [{"slug": s, "views": v} for s, v in top_categories],
        "top_tools_all_time": top_by_views,
    }


def _td(**kw):
    from datetime import timedelta
    return timedelta(**kw)


# ---------- Chat ----------
SYSTEM_PROMPT = """You are TOOLSCOUT, a sharp AI tool recommender for the Archive/AI directory.
Recommend 2–4 specific tools by name (ChatGPT, Claude, Midjourney, Cursor, Perplexity, Suno, ElevenLabs, Runway, Notion AI, Lovable, v0, HeyGen, Ideogram, Gamma, DeepSeek, Zapier, Make, n8n, Devin, Manus).
For each: one-line why-it-fits, a free alternative if relevant, and a copy-pasteable first-prompt example.
If asked about money: give 2-3 concrete monetization strategies grounded in real freelance/creator/agency workflows.
Tone: direct, confident. Short paragraphs, bullet markers "→". Under 250 words unless asked deeper."""


@api_router.post("/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "LLM key not configured")
    await db.chat_messages.insert_one({
        "session_id": req.session_id, "role": "user",
        "content": req.message, "ts": now_iso(),
    })
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    async def gen():
        full = []
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            await db.chat_messages.insert_one({
                "session_id": req.session_id, "role": "assistant",
                "content": "".join(full), "ts": now_iso(),
            })
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.exception("chat error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        gen(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---------- Seed / Admin util ----------
@api_router.post("/admin/reseed")
async def reseed(_: dict = Depends(require_admin)):
    return await _seed_content(force=True)


@api_router.get("/")
async def root():
    return {"app": "Archive/AI", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def _seed_content(force: bool = False):
    from seed_data import CATEGORIES, TOOLS, CAREER_PACKS
    # Seed each collection independently — safe for existing production data.
    if force:
        await db.categories.delete_many({})
        await db.tools.delete_many({})
        await db.career_packs.delete_many({})

    # Categories: upsert by slug — insert missing AND refresh description/icon/name for existing
    if CATEGORIES:
        for c in CATEGORIES:
            existing = await db.categories.find_one({"slug": c["slug"]}, {"_id": 0})
            if existing:
                # Refresh display fields; keep original id
                await db.categories.update_one(
                    {"slug": c["slug"]},
                    {"$set": {"name": c["name"], "description": c["description"], "icon": c["icon"],
                              "parent_slug": c.get("parent_slug"), "sort": c.get("sort", 100)}}
                )
            else:
                await db.categories.insert_one(Category(**c).model_dump())
        logger.info("Categories synced (%d total)", await db.categories.count_documents({}))

    # Tools: only seed the core curated 27 if collection is empty
    if TOOLS and await db.tools.count_documents({}) == 0:
        await db.tools.insert_many([Tool(**t).model_dump() for t in TOOLS])
        logger.info("Seeded %d core tools", len(TOOLS))

    # Career packs: upsert missing slugs
    if CAREER_PACKS:
        existing_packs = set()
        async for d in db.career_packs.find({}, {"_id": 0, "slug": 1}):
            existing_packs.add(d["slug"])
        new_packs = [CareerPack(**p).model_dump() for p in CAREER_PACKS if p["slug"] not in existing_packs]
        if new_packs:
            await db.career_packs.insert_many(new_packs)
            logger.info("Seeded %d new career packs", len(new_packs))

    return {
        "categories": await db.categories.count_documents({}),
        "tools": await db.tools.count_documents({}),
        "career_packs": await db.career_packs.count_documents({}),
    }


async def _seed_super_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower().strip()
    pwd = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "name": "Super Admin",
            "role": "super_admin",
            "password_hash": hash_password(pwd),
            "created_at": now_iso(),
            "last_login_at": None,
        })
        logger.info("Seeded super admin %s", email)
    else:
        # Ensure role & password match .env (idempotent)
        updates = {}
        if existing.get("role") != "super_admin":
            updates["role"] = "super_admin"
        if not verify_password(pwd, existing.get("password_hash", "")):
            updates["password_hash"] = hash_password(pwd)
        if updates:
            await db.users.update_one({"email": email}, {"$set": updates})


@app.on_event("startup")
async def on_start():
    try:
        await db.users.create_index("email", unique=True)
        await db.tools.create_index("slug", unique=True)
        await db.categories.create_index("slug", unique=True)
        await db.career_packs.create_index("slug", unique=True)
        await _seed_super_admin()
        await _seed_content(force=False)
        # Auto-import extra tools (idempotent — skips existing slugs)
        try:
            from extra_tools import build_extra_tools
            tools = build_extra_tools()
            existing = set()
            async for d in db.tools.find({}, {"_id": 0, "slug": 1}):
                existing.add(d["slug"])
            new = [Tool(**t).model_dump() for t in tools if t["slug"] not in existing]
            if new:
                await db.tools.insert_many(new)
                logger.info("Imported %d extra tools", len(new))
        except Exception as e:
            logger.exception("extra import failed: %s", e)
    except Exception as e:
        logger.exception("startup error: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
