"""Unit tests for backend/extra_tools.py.

Covers the pure helpers (_slug, _price), the category mapping, and the
build_extra_tools() transformation. These run fully in-process with no server
or database.
"""

import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import extra_tools  # noqa: E402


class TestSlug:
    @pytest.mark.parametrize(
        "name,expected",
        [
            ("ChatGPT", "chatgpt"),
            ("Copy.ai", "copy-ai"),
            ("DALL·E 3", "dall-e-3"),
            ("Make.com", "make-com"),
            ("11x", "11x"),
            ("Perplexity Comet", "perplexity-comet"),
            ("  Leading/Trailing  ", "leading-trailing"),
            ("AI2SQL", "ai2sql"),
        ],
    )
    def test_slug(self, name, expected):
        assert extra_tools._slug(name) == expected

    def test_slug_strips_leading_and_trailing_separators(self):
        assert extra_tools._slug("---Hello---") == "hello"

    def test_slug_all_symbols(self):
        assert extra_tools._slug("!!!") == ""


class TestPrice:
    def test_free_when_free_model_and_free_plan(self):
        assert extra_tools._price("Yes", "Free") == "free"

    def test_freemium_not_treated_as_free(self):
        assert extra_tools._price("Yes", "Freemium") == "freemium"

    def test_subscription_with_free_plan_is_freemium(self):
        assert extra_tools._price("Yes", "Subscription") == "freemium"

    def test_paid_when_no_free_plan(self):
        assert extra_tools._price("No", "Subscription") == "paid"
        assert extra_tools._price("No", "Enterprise") == "paid"

    def test_case_and_whitespace_insensitive(self):
        assert extra_tools._price("  YES  ", "  free  ") == "free"

    def test_none_inputs_default_to_paid(self):
        assert extra_tools._price(None, None) == "paid"

    def test_free_model_but_no_free_plan_is_paid(self):
        # "free" in model but free_plan != yes -> paid
        assert extra_tools._price("No", "Free") == "paid"


class TestCatMap:
    def test_known_category_mapped(self):
        assert extra_tools.CAT_MAP["AI Chatbots"] == "chat"
        assert extra_tools.CAT_MAP["AI Coding Assistants"] == "code"

    def test_all_mapped_values_are_nonempty_slugs(self):
        for value in extra_tools.CAT_MAP.values():
            assert value and value == value.lower()


@pytest.fixture(scope="module")
def tools():
    return extra_tools.build_extra_tools()


class TestBuildExtraTools:
    def test_row_count_matches_raw(self, tools):
        assert len(tools) == len(extra_tools.RAW)

    def test_all_required_keys_present(self, tools):
        required = {
            "name",
            "slug",
            "tagline",
            "description",
            "category",
            "category_slugs",
            "pricing",
            "url",
            "logo_url",
            "use_cases",
            "featured",
            "trending",
            "new_launch",
            "updated_recently",
            "view_count",
        }
        for t in tools:
            assert required.issubset(t.keys())

    def test_slugs_are_unique(self, tools):
        slugs = [t["slug"] for t in tools]
        assert len(slugs) == len(set(slugs))

    def test_pricing_values_valid(self, tools):
        assert all(t["pricing"] in {"free", "freemium", "paid"} for t in tools)

    def test_category_falls_back_to_chat(self, tools):
        # Every category must resolve to a known taxonomy slug or the "chat" default.
        valid = set(extra_tools.CAT_MAP.values()) | {"chat"}
        for t in tools:
            assert t["category"] in valid
            assert t["category_slugs"] == [t["category"]]

    def test_tagline_truncated_to_120(self, tools):
        assert all(len(t["tagline"]) <= 120 for t in tools)

    def test_description_includes_company(self, tools):
        assert all(t["description"].endswith(".") for t in tools)
        assert all(" By " in t["description"] for t in tools)

    def test_default_flags_and_counts(self, tools):
        for t in tools:
            assert t["featured"] is False
            assert t["trending"] is False
            assert t["view_count"] == 0
            assert t["logo_url"] is None

    def test_use_cases_populated_from_best_for(self, tools):
        # Every RAW row has a non-empty best_for, so use_cases should have 1 entry.
        assert all(len(t["use_cases"]) == 1 for t in tools)
