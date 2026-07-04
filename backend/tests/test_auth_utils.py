"""Unit tests for backend/auth_utils.py.

These are pure in-process unit tests (no running server or database required),
covering password hashing/verification, JWT creation/decoding, and token
extraction from requests. The existing integration suites only exercise this
module indirectly through a live HTTP server, so these tests fill the gap.
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import pytest

# Ensure the backend package root is importable when running from repo root.
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import auth_utils  # noqa: E402


@pytest.fixture(autouse=True)
def _jwt_secret(monkeypatch):
    """Provide a deterministic secret for token tests."""
    monkeypatch.setenv("JWT_SECRET", "unit-test-secret-that-is-long-enough-32b")
    yield


# ---------- Password hashing ----------
class TestPasswordHashing:
    def test_hash_password_returns_str(self):
        hashed = auth_utils.hash_password("hunter2")
        assert isinstance(hashed, str)
        assert hashed != "hunter2"

    def test_hash_password_is_salted(self):
        # Same input hashed twice should differ (random salt).
        assert auth_utils.hash_password("same") != auth_utils.hash_password("same")

    def test_verify_password_roundtrip(self):
        hashed = auth_utils.hash_password("correct horse")
        assert auth_utils.verify_password("correct horse", hashed) is True

    def test_verify_password_wrong(self):
        hashed = auth_utils.hash_password("correct horse")
        assert auth_utils.verify_password("battery staple", hashed) is False

    def test_verify_password_unicode(self):
        pw = "pässwörd-🔐"
        hashed = auth_utils.hash_password(pw)
        assert auth_utils.verify_password(pw, hashed) is True

    def test_verify_password_invalid_hash_returns_false(self):
        # A malformed hash must not raise, just return False.
        assert auth_utils.verify_password("whatever", "not-a-bcrypt-hash") is False


# ---------- JWT tokens ----------
class TestTokens:
    def test_create_and_decode_roundtrip(self):
        token = auth_utils.create_access_token("uid-1", "a@b.com", "admin")
        assert isinstance(token, str)
        decoded = auth_utils.decode_token(token)
        assert decoded["sub"] == "uid-1"
        assert decoded["email"] == "a@b.com"
        assert decoded["role"] == "admin"
        assert decoded["type"] == "access"
        assert "exp" in decoded

    def test_token_expiry_roughly_seven_days(self):
        token = auth_utils.create_access_token("uid", "e@x.com", "user")
        decoded = auth_utils.decode_token(token)
        exp = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        delta = exp - now
        assert timedelta(days=6, hours=23) < delta <= timedelta(days=7)

    def test_decode_with_wrong_secret_raises(self, monkeypatch):
        token = auth_utils.create_access_token("uid", "e@x.com", "user")
        monkeypatch.setenv("JWT_SECRET", "a-totally-different-secret-32-bytes-long")
        with pytest.raises(jwt.InvalidSignatureError):
            auth_utils.decode_token(token)

    def test_decode_expired_token_raises(self, monkeypatch):
        payload = {
            "sub": "uid",
            "email": "e@x.com",
            "role": "user",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
            "type": "access",
        }
        expired = jwt.encode(
            payload, os.environ["JWT_SECRET"], algorithm=auth_utils.JWT_ALGORITHM
        )
        with pytest.raises(jwt.ExpiredSignatureError):
            auth_utils.decode_token(expired)

    def test_secret_missing_raises_keyerror(self, monkeypatch):
        monkeypatch.delenv("JWT_SECRET", raising=False)
        with pytest.raises(KeyError):
            auth_utils.create_access_token("uid", "e@x.com", "user")


# ---------- Token extraction ----------
class _FakeRequest:
    """Minimal stand-in for starlette.Request exposing cookies + headers."""

    def __init__(self, cookies=None, headers=None):
        self.cookies = cookies or {}
        self.headers = headers or {}


class TestExtractToken:
    def test_prefers_cookie(self):
        req = _FakeRequest(
            cookies={"access_token": "cookie-tok"},
            headers={"Authorization": "Bearer header-tok"},
        )
        assert auth_utils.extract_token(req) == "cookie-tok"

    def test_falls_back_to_bearer_header(self):
        req = _FakeRequest(headers={"Authorization": "Bearer header-tok"})
        assert auth_utils.extract_token(req) == "header-tok"

    def test_returns_none_when_absent(self):
        assert auth_utils.extract_token(_FakeRequest()) is None

    def test_ignores_non_bearer_authorization(self):
        req = _FakeRequest(headers={"Authorization": "Basic abc123"})
        assert auth_utils.extract_token(req) is None

    def test_empty_cookie_falls_through_to_header(self):
        req = _FakeRequest(
            cookies={"access_token": ""},
            headers={"Authorization": "Bearer header-tok"},
        )
        assert auth_utils.extract_token(req) == "header-tok"
