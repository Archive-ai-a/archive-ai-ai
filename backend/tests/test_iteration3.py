"""
Iteration 3 backend tests: register, bookmarks, rate-limited login, import-extras, tools count.
"""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

SUPER_EMAIL = "soumyaranjansrb9@gmail.com"
SUPER_PASS = "Srb123@#"


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------- Tools count ----------
def test_tools_count_at_least_124():
    r = requests.get(f"{API}/tools", params={"limit": 500})
    assert r.status_code == 200
    tools = r.json()
    assert len(tools) >= 124, f"Expected >=124 tools, got {len(tools)}"


# ---------- Registration ----------
class TestRegister:
    email = f"qa_bm_{uuid.uuid4().hex[:8]}@example.com"
    password = "testpass1"
    token = None

    def test_register_new_user(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": self.__class__.email, "password": self.password, "name": "QA User"
        })
        assert r.status_code == 200, r.text
        j = r.json()
        assert "token" in j and "user" in j
        assert j["user"]["role"] == "user"
        assert j["user"]["email"] == self.__class__.email
        assert "password_hash" not in j["user"]
        self.__class__.token = j["token"]

    def test_register_duplicate_email(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": self.__class__.email, "password": self.password
        })
        assert r.status_code == 400

    def test_register_short_password(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": f"short_{uuid.uuid4().hex[:6]}@x.com", "password": "abc"
        })
        assert r.status_code == 400

    def test_me_returns_new_user(self):
        assert self.__class__.token
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {self.__class__.token}"})
        assert r.status_code == 200
        assert r.json()["email"] == self.__class__.email
        assert r.json()["role"] == "user"


# ---------- Bookmarks ----------
class TestBookmarks:
    email = f"qa_bmk_{uuid.uuid4().hex[:8]}@example.com"
    password = "testpass1"
    headers = None

    @classmethod
    def _register(cls):
        if cls.headers:
            return
        r = requests.post(f"{API}/auth/register", json={"email": cls.email, "password": cls.password})
        assert r.status_code == 200
        cls.headers = {"Authorization": f"Bearer {r.json()['token']}"}

    def test_bookmarks_require_auth(self):
        r = requests.get(f"{API}/bookmarks")
        assert r.status_code == 401

    def test_add_bookmark(self):
        self._register()
        r = requests.post(f"{API}/bookmarks/chatgpt", headers=self.headers)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_list_bookmarks(self):
        self._register()
        r = requests.get(f"{API}/bookmarks", headers=self.headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        slugs = [t["slug"] for t in data]
        assert "chatgpt" in slugs

    def test_add_bookmark_invalid_slug(self):
        self._register()
        r = requests.post(f"{API}/bookmarks/does-not-exist", headers=self.headers)
        assert r.status_code == 404

    def test_remove_bookmark(self):
        self._register()
        r = requests.delete(f"{API}/bookmarks/chatgpt", headers=self.headers)
        assert r.status_code == 200
        # verify removed
        r2 = requests.get(f"{API}/bookmarks", headers=self.headers)
        slugs = [t["slug"] for t in r2.json()]
        assert "chatgpt" not in slugs


# ---------- Rate-limited login ----------
def test_rate_limit_login_returns_429_after_5():
    """5 bad attempts -> 401; 6th -> 429. Keyed by email so use throwaway email."""
    # cleanup any prior state via mongoshell — but test env may not permit. Use unique email.
    email = f"rl_{uuid.uuid4().hex[:8]}@example.com"
    # register with a known password
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "correctpass1"})
    assert r.status_code == 200

    # 5 wrong logins
    for i in range(5):
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
        assert r.status_code == 401, f"attempt {i+1}: {r.status_code} {r.text}"

    # 6th should be locked out (429)
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
    assert r.status_code == 429, f"6th attempt expected 429, got {r.status_code}"

    # Even correct password blocked while locked
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": "correctpass1"})
    assert r.status_code == 429


# ---------- Import extras ----------
class TestImportExtras:
    def test_requires_auth(self):
        r = requests.post(f"{API}/admin/import-extras")
        assert r.status_code == 401

    def test_import_extras_idempotent(self, admin_headers):
        # First call — may add 0 since startup already ran, but must succeed
        r = requests.post(f"{API}/admin/import-extras", headers=admin_headers)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "added" in j and "total_available" in j
        assert j["total_available"] >= 90  # ~97 extras
        # Second call — should add 0 (idempotent)
        r2 = requests.post(f"{API}/admin/import-extras", headers=admin_headers)
        assert r2.status_code == 200
        assert r2.json()["added"] == 0


# ---------- Regression: admin login still works ----------
def test_admin_login_regression():
    r = requests.post(f"{API}/auth/login", json={"email": SUPER_EMAIL, "password": SUPER_PASS})
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "super_admin"
