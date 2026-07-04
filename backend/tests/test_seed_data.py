"""Unit tests for backend/seed_data.py.

Covers the T() tool-builder helper and the structural integrity / referential
consistency of the seeded CATEGORIES, TOOLS, CAREER_PACKS, FAQ, and ROADMAP
data. Pure in-process tests (no server or database).
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import seed_data  # noqa: E402


class TestToolBuilder:
    def _minimal(self, **overrides):
        kwargs = dict(
            name="Foo",
            slug="foo",
            tagline="tag",
            description="desc",
            category_slugs=["chat"],
            pricing="free",
            url="https://foo",
            use_cases=[],
            alts=[],
            prompts=[],
            pros=[],
            cons=[],
            professions=[],
            start_here=[],
            make_money=[],
            irl=[],
        )
        kwargs.update(overrides)
        return seed_data.T(**kwargs)

    def test_category_defaults_to_first_slug(self):
        t = self._minimal(category_slugs=["image", "designers"])
        assert t["category"] == "image"

    def test_category_defaults_to_chat_when_empty(self):
        t = self._minimal(category_slugs=[])
        assert t["category"] == "chat"

    def test_default_flags_false_and_view_count_zero(self):
        t = self._minimal()
        assert t["featured"] is False
        assert t["trending"] is False
        assert t["new_launch"] is False
        assert t["updated_recently"] is False
        assert t["view_count"] == 0

    def test_flags_can_be_overridden(self):
        t = self._minimal(featured=True, trending=True)
        assert t["featured"] is True
        assert t["trending"] is True

    def test_field_mapping(self):
        t = self._minimal(
            alts=["a"], prompts=["p"], make_money=[{"title": "m"}], irl=["i"]
        )
        assert t["free_alternatives"] == ["a"]
        assert t["best_prompts"] == ["p"]
        assert t["make_money_module"] == [{"title": "m"}]
        assert t["irl_use_cases"] == ["i"]


class TestCategories:
    def test_groups_are_top_level(self):
        assert all(g["parent_slug"] is None for g in seed_data.GROUPS)

    def test_category_slugs_unique(self):
        slugs = [c["slug"] for c in seed_data.CATEGORIES]
        assert len(slugs) == len(set(slugs))

    def test_subcategory_parents_exist(self):
        group_slugs = {g["slug"] for g in seed_data.GROUPS}
        for _name, _slug, parent, _icon, _desc in seed_data.SUBS:
            assert parent in group_slugs

    def test_categories_is_groups_plus_subs(self):
        assert len(seed_data.CATEGORIES) == len(seed_data.GROUPS) + len(seed_data.SUBS)


class TestTools:
    def test_tool_slugs_unique(self):
        slugs = [t["slug"] for t in seed_data.TOOLS]
        assert len(slugs) == len(set(slugs))

    def test_every_tool_has_core_fields(self):
        for t in seed_data.TOOLS:
            assert t["name"]
            assert t["slug"]
            assert t["url"].startswith("http")
            assert t["pricing"] in {"free", "freemium", "paid"}
            assert t["category"] == t["category_slugs"][0]

    def test_tool_category_slugs_reference_known_categories(self):
        known = {c["slug"] for c in seed_data.CATEGORIES}
        for t in seed_data.TOOLS:
            for cs in t["category_slugs"]:
                assert cs in known, f"{t['slug']} references unknown category {cs}"


class TestCareerPacks:
    def test_pack_slugs_unique(self):
        slugs = [p["slug"] for p in seed_data.CAREER_PACKS]
        assert len(slugs) == len(set(slugs))

    def test_workflow_steps_reference_pack_tools(self):
        for pack in seed_data.CAREER_PACKS:
            tool_slugs = set(pack["tool_slugs"])
            for step in pack["workflow_steps"]:
                assert step["tool"] in tool_slugs, (
                    f"pack {pack['slug']} step references {step['tool']} "
                    "not in its tool_slugs"
                )

    def test_pack_required_fields(self):
        for pack in seed_data.CAREER_PACKS:
            for key in (
                "name",
                "slug",
                "description",
                "profession",
                "tool_slugs",
                "workflow_steps",
                "image_url",
            ):
                assert key in pack


class TestFaqAndRoadmap:
    def test_faq_entries_have_q_and_a(self):
        assert seed_data.FAQ
        for entry in seed_data.FAQ:
            assert entry["q"] and entry["a"]

    def test_roadmap_statuses_valid(self):
        valid = {"shipped", "in-progress", "planned"}
        assert seed_data.ROADMAP
        for phase in seed_data.ROADMAP:
            assert phase["status"] in valid
            assert isinstance(phase["items"], list) and phase["items"]
