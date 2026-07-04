"""Shared CRUD utilities for slug-based MongoDB collections."""
from fastapi import HTTPException
from typing import Optional


async def find_by_slug(collection, slug: str, *, projection: Optional[dict] = None):
    """Find a document by slug, raising 404 if not found."""
    proj = projection or {"_id": 0}
    doc = await collection.find_one({"slug": slug}, proj)
    if not doc:
        raise HTTPException(404, "Not found")
    return doc


async def delete_by_slug(collection, slug: str):
    """Delete a document by slug, raising 404 if it doesn't exist."""
    r = await collection.delete_one({"slug": slug})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


async def check_slug_available(collection, slug: str):
    """Raise 400 if slug already exists in the collection."""
    exists = await collection.find_one({"slug": slug})
    if exists:
        raise HTTPException(400, "Slug exists")


async def upsert_by_slug(collection, slug: str, data: dict, *, preserve_fields: tuple = ()):
    """Update an existing document by slug, preserving specified fields from the original."""
    existing = await collection.find_one({"slug": slug}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Not found")
    for field in preserve_fields:
        if field in existing:
            data[field] = existing[field]
    await collection.update_one({"slug": slug}, {"$set": data})
    return data


async def import_by_slug(collection, items: list, *, model_cls):
    """Import items that don't already exist (by slug). Returns count added."""
    existing_slugs = set()
    async for d in collection.find({}, {"_id": 0, "slug": 1}):
        existing_slugs.add(d["slug"])
    new_items = [model_cls(**t).model_dump() for t in items if t["slug"] not in existing_slugs]
    if new_items:
        await collection.insert_many(new_items)
    return len(new_items)
