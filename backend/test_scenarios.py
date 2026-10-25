"""
Unit & Integration Tests for Predefined Workspace Scenario Library
Verifies:
1. All 10 prebuilt scenarios exist with exact IDs and metadata.
2. Every scenario rubric's weights sum to exactly 100.0%.
3. Deterministic scoring formula strictly enforces (rating / 5) * weight.
4. Interactive branching correctly triggers strong vs weak branches.
5. FastAPI endpoints: /api/scenarios, /api/scenarios/{id}, /api/scenarios/evaluate.
"""

import unittest
from fastapi.testclient import TestClient
from main import app
import scenario_library

client = TestClient(app)

class TestScenarioLibrary(unittest.TestCase):
    def test_library_validation(self):
        """Verifies scenario library integrity and 100% weight constraints."""
        res = scenario_library.validate_scenario_library()
        self.assertTrue(res["valid"], f"Validation failed with errors: {res.get('errors')}")
        self.assertEqual(res["scenario_count"], 10)

    def test_required_scenario_ids_exist(self):
        """Verifies all 10 required scenarios are present with exact IDs."""
        expected_ids = [
            "angry-client",
            "deadline-collision",
            "team-conflict",
            "ceo-surprise-question",
            "production-failure",
            "costly-mistake",
            "challenging-interviewer",
            "last-minute-presentation",
            "unrealistic-request",
            "ambiguous-assignment",
        ]
        for sc_id in expected_ids:
            self.assertIn(sc_id, scenario_library.PREDEFINED_SCENARIOS, f"Missing required scenario: {sc_id}")
            sc = scenario_library.PREDEFINED_SCENARIOS[sc_id]
            self.assertEqual(sc.id, sc_id)
            self.assertTrue(len(sc.title) > 0)
            self.assertTrue(len(sc.opening_message) > 0)
            self.assertTrue(len(sc.rubric) >= 4)
            # Verify weight sum
            total_weight = sum(c.weight for c in sc.rubric)
            self.assertAlmostEqual(total_weight, 100.0, places=2)

    def test_deterministic_scoring_extremes(self):
        """Verifies (rating / 5.0) * weight deterministic scoring formula."""
        sc = scenario_library.PREDEFINED_SCENARIOS["angry-client"]

        # Maximum score (all 5s)
        all_fives = {c.id: 5 for c in sc.rubric}
        res_max = scenario_library.calculate_rubric_score("angry-client", all_fives)
        self.assertEqual(res_max["score"], 100.0)
        self.assertTrue(res_max["passed"])
        self.assertEqual(res_max["selected_branch"]["branch_id"], "strong_response")

        # Minimum score (all 1s)
        all_ones = {c.id: 1 for c in sc.rubric}
        res_min = scenario_library.calculate_rubric_score("angry-client", all_ones)
        self.assertEqual(res_min["score"], 20.0)
        self.assertFalse(res_min["passed"])
        self.assertEqual(res_min["selected_branch"]["branch_id"], "weak_response")

    def test_branching_threshold(self):
        """Verifies that score >= 70 selects strong_response and score < 70 selects weak_response."""
        sc = scenario_library.PREDEFINED_SCENARIOS["deadline-collision"]
        
        # Rating 4 on all criteria -> (4/5) * 100 = 80.0 -> strong branch
        ratings_strong = {c.id: 4 for c in sc.rubric}
        res_strong = scenario_library.calculate_rubric_score("deadline-collision", ratings_strong)
        self.assertEqual(res_strong["score"], 80.0)
        self.assertEqual(res_strong["selected_branch"]["branch_id"], "strong_response")

        # Rating 3 on all criteria -> (3/5) * 100 = 60.0 -> weak branch
        ratings_weak = {c.id: 3 for c in sc.rubric}
        res_weak = scenario_library.calculate_rubric_score("deadline-collision", ratings_weak)
        self.assertEqual(res_weak["score"], 60.0)
        self.assertEqual(res_weak["selected_branch"]["branch_id"], "weak_response")

    def test_personalized_recommendation(self):
        """Verifies personalized recommendation targets lowest-scoring skill."""
        rec = scenario_library.get_scenario_recommendation(
            completed_scenarios=["angry-client"],
            skill_scores={"prioritisation": 40.0, "communication": 85.0}
        )
        self.assertIsNotNone(rec)
        self.assertEqual(rec["scenario_id"], "deadline-collision")
        self.assertIn("Prioritisation", rec["rationale"])

    def test_api_list_scenarios(self):
        """GET /api/scenarios returns all 10 scenarios and supports filters."""
        res = client.get("/api/scenarios")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_count"], 10)
        self.assertEqual(len(data["scenarios"]), 10)

        # Filter by difficulty
        res_hard = client.get("/api/scenarios?difficulty=Hard")
        self.assertEqual(res_hard.status_code, 200)
        data_hard = res_hard.json()
        for s in data_hard["scenarios"]:
            self.assertEqual(s["difficulty"], "Hard")

    def test_api_get_scenario_by_id(self):
        """GET /api/scenarios/{id} returns scenario details or 404."""
        res = client.get("/api/scenarios/angry-client")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["scenario"]["id"], "angry-client")
        self.assertEqual(data["scenario"]["character"]["voice_profile"], "upset_client")

        res_404 = client.get("/api/scenarios/non-existent-scenario")
        self.assertEqual(res_404.status_code, 404)

    def test_api_evaluate_scenario(self):
        """POST /api/scenarios/evaluate scores candidate answer and returns branch dialogue."""
        payload = {
            "scenario_id": "angry-client",
            "candidate_answer": (
                "Elena, I completely understand the frustration and how critical this is for your board meeting. "
                "I take full personal responsibility for this delay. We experienced a database migration timeout at 8:15 AM. "
                "I have already generated a manual CSV export of your Q3 figures and sent it to your email right now so you have the numbers for your board. "
                "Our deployment will complete by 10:15 AM, and I will call you every 20 minutes with a live status update."
            ),
            "turn_id": 1,
            "completed_scenarios": ["angry-client"]
        }
        res = client.post("/api/scenarios/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["scenario_id"], "angry-client")
        self.assertIn("score", data)
        self.assertTrue(0 <= data["score"] <= 100)
        self.assertIn("criterion_breakdown", data)
        self.assertIn("selected_branch", data)
        self.assertIn("recommendation", data)


if __name__ == "__main__":
    unittest.main()
