"""
Backend test suite for Archive/AI directory app.
Covers: auth, tools/categories/career-packs CRUD, admin RBAC, FAQ, roadmap, analytics, chat SSE.
"""
import os
import json
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

SUPER_EMAIL = os.environ["SUPER_ADMIN_EMAIL"]
SUPER_PASS = os.environ["SUPER_ADMIN_PASSWORD"]


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["role"] == "super_admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Health / root ----------
def test_root_ok():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_login_bad_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_ok_sets_cookie(self):
        r = requests.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
        assert r.status_code == 200
        assert "access_token" in r.cookies
        j = r.json()
        assert j["user"]["email"] == SUPER_EMAIL
        assert j["user"]["role"] == "super_admin"
        assert "password_hash" not in j["user"]

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["email"] == SUPER_EMAIL

    def test_me_with_cookie(self):
        sess = requests.Session()
        sess.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
        r = sess.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == SUPER_EMAIL


# ---------- Public listings ----------
class TestPublic:
    def test_tools_list(self):
        r = requests.get(f"{API}/tools")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 27
        assert all("slug" in t and "name" in t for t in data)

    def test_tools_filter_by_category(self):
        r = requests.get(f"{API}/tools", params={"category": "text-generation"})
        assert r.status_code == 200

    def test_tools_search(self):
        r = requests.get(f"{API}/tools", params={"q": "chat"})
        assert r.status_code == 200
        assert any("chat" in (t.get("name", "") + t.get("description", "")).lower() for t in r.json())

    def test_tool_detail(self):
        r = requests.get(f"{API}/tools/chatgpt")
        assert r.status_code == 200
        t = r.json()
        assert t["slug"] == "chatgpt"
        # richer fields
        assert isinstance(t.get("start_here_workflow", []), list)
        assert isinstance(t.get("make_money_module", []), list)
        assert isinstance(t.get("irl_use_cases", []), list)
        assert isinstance(t.get("best_prompts", []), list)

    def test_tool_detail_404(self):
        r = requests.get(f"{API}/tools/no-such-tool")
        assert r.status_code == 404

    def test_categories(self):
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) >= 7
        # There should exist top-level (parent_slug=None) and sub-cats
        top = [c for c in cats if not c.get("parent_slug")]
        subs = [c for c in cats if c.get("parent_slug")]
        assert len(top) >= 6
        assert len(subs) >= 1

    def test_career_packs(self):
        r = requests.get(f"{API}/career-packs")
        assert r.status_code == 200
        packs = r.json()
        assert len(packs) >= 5
        # Detail
        r2 = requests.get(f"{API}/career-packs/{packs[0]['slug']}")
        assert r2.status_code == 200
        p = r2.json()
        assert isinstance(p.get("workflow_steps", []), list)
        assert isinstance(p.get("tool_slugs", []), list)

    def test_faq(self):
        r = requests.get(f"{API}/faq")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "q" in data[0] and "a" in data[0]

    def test_roadmap(self):
        r = requests.get(f"{API}/roadmap")
        assert r.status_code == 200
        data = r.json()
        # phases: shipped/in-progress/planned
        assert isinstance(data, (list, dict))


# ---------- Admin auth guards ----------
class TestAdminGuards:
    def test_admin_endpoints_require_auth(self):
        for path in ["/admin/users", "/admin/admins", "/admin/analytics"]:
            r = requests.get(f"{API}{path}")
            assert r.status_code == 401, f"{path} should require auth"

    def test_create_tool_requires_auth(self):
        r = requests.post(f"{API}/tools", json={"name": "x", "slug": "x", "tagline": "x", "description": "x", "pricing": "free", "url": "https://x"})
        assert r.status_code == 401

    def test_super_admin_only_for_create_admin(self):
        # We only have one super admin — verify plain endpoint response with no auth is 401 (guard before 403)
        r = requests.post(f"{API}/admin/admins", json={"email": "x@x.com", "password": "p", "role": "admin"})
        assert r.status_code in (401, 403)


# ---------- Admin CRUD ----------
class TestToolCRUD:
    slug = f"test-tool-{uuid.uuid4().hex[:8]}"

    def test_create_tool(self, admin_headers):
        payload = {
            "name": "TEST_Tool",
            "slug": self.slug,
            "tagline": "test tagline",
            "description": "desc",
            "category": "text-generation",
            "category_slugs": ["text-generation"],
            "pricing": "free",
            "url": "https://example.com",
            "start_here_workflow": ["step 1", "step 2", "step 3"],
            "make_money_module": [{"title": "M", "desc": "d"}],
            "irl_use_cases": ["case"],
        }
        r = requests.post(f"{API}/tools", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        t = r.json()
        assert t["slug"] == self.slug
        # verify persistence via GET
        r2 = requests.get(f"{API}/tools/{self.slug}")
        assert r2.status_code == 200
        assert r2.json()["name"] == "TEST_Tool"

    def test_update_tool(self, admin_headers):
        payload = {
            "name": "TEST_Tool_UPD",
            "slug": self.slug,
            "tagline": "updated",
            "description": "desc",
            "category": "text-generation",
            "category_slugs": ["text-generation"],
            "pricing": "free",
            "url": "https://example.com",
        }
        r = requests.put(f"{API}/tools/{self.slug}", json=payload, headers=admin_headers)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/tools/{self.slug}")
        assert r2.json()["name"] == "TEST_Tool_UPD"

    def test_delete_tool(self, admin_headers):
        r = requests.delete(f"{API}/tools/{self.slug}", headers=admin_headers)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/tools/{self.slug}")
        assert r2.status_code == 404


class TestCategoryCRUD:
    slug = f"test-cat-{uuid.uuid4().hex[:8]}"

    def test_create_category(self, admin_headers):
        r = requests.post(f"{API}/categories", json={
            "name": "TEST_Cat", "slug": self.slug, "description": "d",
            "icon": "Sparkles", "parent_slug": None, "sort": 999
        }, headers=admin_headers)
        assert r.status_code == 200, r.text

    def test_update_category(self, admin_headers):
        r = requests.put(f"{API}/categories/{self.slug}", json={
            "name": "TEST_Cat_UPD", "slug": self.slug, "description": "d",
            "icon": "Sparkles", "parent_slug": None, "sort": 999
        }, headers=admin_headers)
        assert r.status_code == 200

    def test_delete_category(self, admin_headers):
        r = requests.delete(f"{API}/categories/{self.slug}", headers=admin_headers)
        assert r.status_code == 200


class TestCareerPackCRUD:
    slug = f"test-pack-{uuid.uuid4().hex[:8]}"

    def test_create_pack(self, admin_headers):
        r = requests.post(f"{API}/career-packs", json={
            "name": "TEST_Pack", "slug": self.slug, "description": "d",
            "profession": "designer", "tool_slugs": ["chatgpt", "midjourney"],
            "workflow_steps": [{"emoji": "✏️", "text": "sketch"}, {"emoji": "🎨", "text": "color"}],
            "image_url": "https://x/y.png"
        }, headers=admin_headers)
        assert r.status_code == 200

    def test_delete_pack(self, admin_headers):
        r = requests.delete(f"{API}/career-packs/{self.slug}", headers=admin_headers)
        assert r.status_code == 200


# ---------- Admin management ----------
class TestAdminManagement:
    invited_id = None
    invited_email = f"test_admin_{uuid.uuid4().hex[:6]}@example.com"

    def test_list_users(self, admin_headers):
        r = requests.get(f"{API}/admin/users", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_admins(self, admin_headers):
        r = requests.get(f"{API}/admin/admins", headers=admin_headers)
        assert r.status_code == 200
        admins = r.json()
        assert any(a["email"] == SUPER_EMAIL for a in admins)

    def test_invite_admin(self, admin_headers):
        r = requests.post(f"{API}/admin/admins", json={
            "email": self.__class__.invited_email,
            "password": "TestP@ss123",
            "name": "TEST Admin",
            "role": "admin",
        }, headers=admin_headers)
        assert r.status_code == 200, r.text
        self.__class__.invited_id = r.json()["id"]

    def test_reset_password(self, admin_headers):
        r = requests.post(f"{API}/admin/admins/reset-password", json={
            "email": self.__class__.invited_email,
            "new_password": "NewP@ss123",
        }, headers=admin_headers)
        assert r.status_code == 200
        # verify new password works
        r2 = requests.post(f"{API}/auth/login", json={
            "email": self.__class__.invited_email, "password": "NewP@ss123"
        })
        assert r2.status_code == 200

    def test_super_admin_cannot_delete_self(self, admin_headers, admin_token):
        # get own id
        me = requests.get(f"{API}/auth/me", headers=admin_headers).json()
        r = requests.delete(f"{API}/admin/admins/{me['id']}", headers=admin_headers)
        assert r.status_code == 400

    def test_delete_admin(self, admin_headers):
        assert self.__class__.invited_id
        r = requests.delete(f"{API}/admin/admins/{self.__class__.invited_id}", headers=admin_headers)
        assert r.status_code == 200


# ---------- Analytics ----------
def test_analytics(admin_headers):
    r = requests.get(f"{API}/admin/analytics", headers=admin_headers)
    assert r.status_code == 200
    j = r.json()
    for k in ("totals", "dau_series", "top_tools", "top_tools_all_time"):
        assert k in j
    assert j["totals"]["tools"] >= 27


# ---------- Chat streaming ----------
def test_chat_stream():
    sid = f"test-{uuid.uuid4().hex[:8]}"
    r = requests.post(
        f"{API}/chat/stream",
        json={"session_id": sid, "message": "Recommend a tool for video editing in one line."},
        stream=True, timeout=45,
    )
    assert r.status_code == 200
    got_delta = False
    got_done = False
    started = time.time()
    for raw in r.iter_lines(decode_unicode=True):
        if not raw:
            continue
        if raw.startswith("data:"):
            payload = raw[5:].strip()
            try:
                obj = json.loads(payload)
            except Exception:
                continue
            if "delta" in obj and obj["delta"]:
                got_delta = True
            if obj.get("done"):
                got_done = True
                break
            if obj.get("error"):
                pytest.fail(f"chat stream error: {obj['error']}")
        if time.time() - started > 40:
            break
    assert got_delta, "no delta chunks received"
    assert got_done, "no done event"
