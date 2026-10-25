"""
Test suite verifying strict grading, zero default marks, and 0-score on trivial/greeting answers.
"""
import unittest
from fastapi.testclient import TestClient
from main import app
from scenario_library import calculate_rubric_score, evaluate_scenario_response

client = TestClient(app)


class TestStrictMarking(unittest.TestCase):
    def test_rubric_defaults_to_zero(self):
        """Missing or unaddressed criteria in calculate_rubric_score must default to rating 0 and 0.0 pts."""
        # Scenario 1 has 5 criteria. Providing an empty dict of ratings should produce score 0.0
        result = calculate_rubric_score("angry-client", {})
        self.assertEqual(result["score"], 0.0)
        self.assertFalse(result["passed"])
        for c_id, data in result["criterion_breakdown"].items():
            self.assertEqual(data["rating"], 0)
            self.assertEqual(data["weighted_points"], 0.0)

    def test_prebuilt_scenario_trivial_answer_scores_zero(self):
        """Evaluating 'hello' on a prebuilt scenario must return score 0.0 and all 0 ratings."""
        res = evaluate_scenario_response("angry-client", "hello")
        self.assertEqual(res["score"], 0.0)
        self.assertEqual(res["overall_score"], 0.0)
        self.assertFalse(res["passed"])
        for c_id, data in res["criterion_breakdown"].items():
            self.assertEqual(data["rating"], 0)
            self.assertEqual(data["weighted_points"], 0.0)
        for skill, score in res["dimension_scores"].items():
            self.assertEqual(score, 0.0)

    def test_api_evaluate_trivial_greeting_scores_zero(self):
        """POST /api/evaluate with answer 'hello' must return overall_score 0.0, ratings 0, dimensions 0.0."""
        payload = {
            "question": {
                "id": 1,
                "text": "The production cluster is down and client data is delayed. What is your containment plan?",
                "character": "VP of Engineering",
                "character_authority_level": 4,
                "priority": "P1"
            },
            "answer": "hello",
            "config": {
                "role": "Senior Site Reliability Engineer",
                "domain": "DevOps",
                "difficulty": "Hard",
                "mode": "workspace",
                "pressureMode": True,
                "strictMode": True
            }
        }
        res = client.post("/api/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["overall_score"], 0.0)
        self.assertEqual(data["verdict"], "developing")
        for key, item in data["criterion_breakdown"].items():
            self.assertEqual(item["rating"], 0)
            self.assertEqual(item["weighted_points"], 0.0)
        for dim, score in data["dimension_scores"].items():
            self.assertEqual(score, 0.0)

    def test_api_scenarios_evaluate_endpoint_trivial_answer(self):
        """POST /api/scenarios/evaluate with 'hello' must return score 0.0."""
        payload = {
            "scenario_id": "angry-client",
            "candidate_answer": "hello",
            "turn_id": 1
        }
        res = client.post("/api/scenarios/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["score"], 0.0)
        self.assertFalse(data["passed"])
        for key, item in data["criterion_breakdown"].items():
            self.assertEqual(item["rating"], 0)
            self.assertEqual(item["weighted_points"], 0.0)

    def test_report_generation_with_zero_scores(self):
        """POST /api/report for sessions where candidate answered 'hello' must yield overall_score 0.0."""
        payload = {
            "config": {
                "role": "Software Engineer",
                "domain": "Engineering",
                "difficulty": "Medium",
                "mode": "interview",
                "strictMode": True
            },
            "qa_pairs": [
                {
                    "question": {"text": "How do you handle a production database deadlock?"},
                    "answer": "hello",
                    "scores": {
                        "overall_score": 0.0,
                        "verdict": "developing",
                        "dimension_scores": {
                            "problem_solving": 0.0,
                            "decision_making": 0.0,
                            "communication": 0.0,
                            "etiquette": 0.0,
                            "prioritisation": 0.0,
                            "accountability": 0.0,
                            "teamwork": 0.0,
                            "adaptability": 0.0
                        }
                    }
                }
            ],
            "flags": []
        }
        res = client.post("/api/report", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["overall_score"], 0.0)
        self.assertIn(data["grade"], ["Needs Work", "Developing"])
        for key, val in data["skill_breakdown"].items():
            self.assertEqual(val, 0.0)


if __name__ == "__main__":
    unittest.main()
