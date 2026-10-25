"""
Comprehensive Test Suite for CrewAI + Google Gemini Multi-Agent Orchestration.
Uses mocks for model inference to ensure zero Gemini free-tier quota is consumed during testing.
"""

import os
import sys
import json
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app
import crew_service

client = TestClient(app)

def test_crew_status_endpoint():
    """Verify /api/crew/status reports CrewAI and Gemini configuration accurately."""
    res = client.get("/api/crew/status")
    assert res.status_code == 200
    data = res.json()
    assert "orchestrator" in data
    assert "CrewAI" in data["orchestrator"]
    assert "gemini_model" in data
    assert data["free_tier_safe"] is True
    print("✓ Crew status endpoint OK:", data)

def test_json_repair_parsing():
    """Verify parse_crew_json handles markdown code fences, outer braces, and slight syntax quirks."""
    valid_snippet = '```json\n{"assessment_plan": {"target_role": "Backend Engineer"}}\n```'
    parsed = crew_service.parse_crew_json(valid_snippet)
    assert parsed["assessment_plan"]["target_role"] == "Backend Engineer"

    messy_snippet = 'Here is the plan:\n{"items": [{"id": 1, "text": "Describe Kafka backpressure"}]}'
    parsed2 = crew_service.parse_crew_json(messy_snippet)
    assert len(parsed2["items"]) == 1
    print("✓ Crew JSON repair parser handles markdown and raw responses cleanly")

def test_crew_eval_report_generation_mocked():
    """Test full evaluation + feedback multi-agent orchestration with mocked LLM output."""
    mock_crew_output = {
        "overall_score": 85.0,
        "grade": "A",
        "strengths": [
            "Demonstrated strong containment reasoning for distributed cache",
            "Clear ownership of root-cause investigation",
            "Effective escalation communication"
        ],
        "weaknesses": [
            "Could specify more granular recovery time objectives",
            "Consider preventative automated healthchecks"
        ],
        "next_steps": [
            "Review circuit-breaker architectural patterns",
            "Practice live stakeholder communication updates"
        ],
        "integrity_note": "Proctor observation: Normal assessment session.",
        "next_scenario_direction": "Advanced Multi-Region Failover Simulation",
        "skill_breakdown": {
            "problem_solving": 88.0,
            "decision_making": 85.0,
            "communication": 82.0,
            "etiquette": 85.0,
            "prioritisation": 86.0,
            "accountability": 90.0,
            "teamwork": 80.0,
            "adaptability": 84.0
        }
    }

    sample_config = {
        "role": "Senior Cloud Engineer",
        "domain": "Software Engineering",
        "company": "Netflix",
        "mode": "scenario",
        "difficulty": "hard"
    }

    sample_qa_pairs = [
        {
            "question": {"text": "A primary Redis cluster has failed during peak traffic. What is your containment plan?"},
            "answer": "Immediately isolate the replica node, promote it to primary, and update DNS while alerting stakeholders.",
            "scores": {
                "dimension_scores": {
                    "problem_solving": 88.0,
                    "decision_making": 85.0,
                    "communication": 82.0,
                    "etiquette": 85.0,
                    "prioritisation": 86.0,
                    "accountability": 90.0,
                    "teamwork": 80.0,
                    "adaptability": 84.0
                }
            }
        }
    ]

    with patch("crew_service.Crew.kickoff", return_value=json.dumps(mock_crew_output)):
        report = crew_service.evaluate_and_generate_report(
            config=sample_config,
            qa_pairs=sample_qa_pairs,
            flags=[]
        )
        assert report["overall_score"] > 80
        assert report["grade"] == "A"
        assert len(report["strengths"]) == 3
        assert "skill_breakdown" in report
        assert "problem_solving" in report["skill_breakdown"]
        print("✓ Crew evaluation & feedback multi-agent flow runs and produces valid schema")

def test_crew_eval_report_idempotency():
    """Verify that identical Q&A transcripts hit in-memory cache without repeating LLM calls."""
    sample_config = {"role": "Engineer", "domain": "Tech"}
    sample_qa = [{"question": "Q1", "answer": "Answer 1", "scores": {}}]

    with patch("crew_service.Crew.kickoff") as mock_kickoff:
        mock_kickoff.return_value = '{"overall_score": 80, "grade": "A", "strengths": [], "weaknesses": [], "next_steps": []}'
        
        # First call
        r1 = crew_service.evaluate_and_generate_report(sample_config, sample_qa)
        # Second call with identical data
        r2 = crew_service.evaluate_and_generate_report(sample_config, sample_qa)
        
        # Crew kickoff should have only been invoked once!
        assert mock_kickoff.call_count == 1
        assert r1 == r2
        print("✓ Idempotency verified: identical transcript requests avoid duplicate Gemini quota usage")

def test_crew_planner_plan_generation_mocked():
    """Test interview planner agent structuring an interview plan."""
    mock_plan = {
        "assessment_plan": {
            "target_role": "Data Engineer",
            "domain": "Software Engineering",
            "difficulty": "medium",
            "core_competencies": ["ETL Pipeline Reliability", "SQL Optimization", "Data Modeling"]
        },
        "items": [
            {
                "id": 1,
                "type": "technical",
                "text": "How do you detect and handle schema drift in an automated ETL pipeline?",
                "character": "Lead Data Architect",
                "character_authority_level": 3,
                "priority": "P2",
                "scenario_context": "Production ETL pipeline ingestion.",
                "objective": "Explain schema enforcement and quarantine tables.",
                "constraints": ["Keep concise"],
                "evaluation_criteria": ["Knowledge of schema validation"]
            }
        ]
    }

    with patch("crew_service.Crew.kickoff", return_value=json.dumps(mock_plan)):
        plan = crew_service.plan_interview_session({
            "role": "Data Engineer",
            "domain": "Software Engineering",
            "difficulty": "medium",
            "numQuestions": 1
        })
        assert "assessment_plan" in plan
        assert len(plan["items"]) == 1
        assert plan["items"][0]["character"] == "Lead Data Architect"
        print("✓ Interview Planner Agent generated valid structured interview plan")

def test_api_report_endpoint_integration():
    """Verify that FastAPI /api/report consumes the CrewAI output cleanly."""
    payload = {
        "config": {
            "mode": "scenario",
            "domain": "Operations",
            "role": "Incident Commander",
            "difficulty": "medium",
            "numQuestions": 1,
            "durationMin": 15,
            "strictMode": True,
            "pressureMode": True
        },
        "qa_pairs": [
            {
                "question": {"id": 1, "text": "Production gateway down. Outline containment steps."},
                "answer": "Reroute incoming traffic to fallback region, scale up standby nodes, notify incident management team.",
                "scores": {
                    "dimension_scores": {
                        "problem_solving": 80.0,
                        "decision_making": 85.0,
                        "communication": 80.0,
                        "etiquette": 80.0,
                        "prioritisation": 90.0,
                        "accountability": 85.0,
                        "teamwork": 80.0,
                        "adaptability": 80.0
                    }
                }
            }
        ],
        "flags": []
    }

    mock_report = {
        "overall_score": 82.5,
        "grade": "A",
        "strengths": ["Rapid traffic redirection", "Strong prioritization under pressure"],
        "weaknesses": ["Add post-mortem documentation timelines"],
        "next_steps": ["Formalize SLA communication templates"],
        "integrity_note": "Normal assessment session.",
        "next_scenario_direction": "Multi-region DNS degradation simulation",
        "skill_breakdown": {
            "problem_solving": 80.0,
            "decision_making": 85.0,
            "communication": 80.0,
            "etiquette": 80.0,
            "prioritisation": 90.0,
            "accountability": 85.0,
            "teamwork": 80.0,
            "adaptability": 80.0
        }
    }

    with patch("crew_service.Crew.kickoff", return_value=json.dumps(mock_report)):
        res = client.post("/api/report", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["overall_score"] >= 80
        assert data["grade"] == "A"
        assert "strengths" in data
        assert "skill_breakdown" in data
        print("✓ FastAPI /api/report integrates seamlessly with CrewAI report format")

if __name__ == "__main__":
    print("\n--- Running CrewAI + Gemini Multi-Agent Test Suite ---")
    test_crew_status_endpoint()
    test_json_repair_parsing()
    test_crew_eval_report_generation_mocked()
    test_crew_eval_report_idempotency()
    test_crew_planner_plan_generation_mocked()
    test_api_report_endpoint_integration()
    print("\n✅ ALL CREWAI + GEMINI TESTS COMPLETED SUCCESSFULLY!")
