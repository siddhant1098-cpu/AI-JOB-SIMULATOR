import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/")
    assert res.status_code == 200
    print("Health check OK:", res.json())

def test_resume_pdf_parse():
    # Construct a minimal valid PDF containing resume text
    minimal_pdf = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 160>>stream
BT
/F1 12 Tf
72 712 Td
(Jordan Lee - Senior Backend Engineer) Tj
72 690 Td
(Email: jordan.lee.tech@gmail.com) Tj
72 668 Td
(Experience: Built high-throughput microservices using FastAPI, Docker, and Kafka.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
0000000185 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
395
%%EOF"""

    files = {"file": ("jordan_lee_resume.pdf", minimal_pdf, "application/pdf")}
    res = client.post("/api/resume/parse", files=files)
    print("Resume Parse Status:", res.status_code)
    data = res.json()
    print("Resume Parse Output:", json.dumps(data, indent=2))
    assert res.status_code == 200
    assert "resume_text" in data
    assert "Jordan" in data.get("candidate_name", "") or "Jordan" in data.get("resume_text", "")
    return data

def test_generate_questions_with_resume(resume_data):
    config = {
        "mode": "interview",
        "domain": resume_data.get("inferred_domain", "Software Engineering"),
        "company": "Netflix",
        "role": resume_data.get("inferred_role", "Senior Backend Engineer"),
        "difficulty": "medium",
        "numQuestions": 3,
        "durationMin": 15,
        "strictMode": True,
        "candidate_name": resume_data.get("candidate_name", "Jordan Lee"),
        "resume_text": resume_data.get("resume_text", ""),
        "resume_skills": resume_data.get("key_skills", []),
        "resume_filename": "jordan_lee_resume.pdf"
    }

    res = client.post("/api/questions", json={"config": config})
    print("Questions Generation Status:", res.status_code)
    data = res.json()
    print("Generated Questions (Grounded in Resume):", json.dumps(data, indent=2))
    assert res.status_code == 200
    assert len(data.get("items", [])) > 0
    return config, data.get("items", [])

if __name__ == "__main__":
    test_health()
    parsed_resume = test_resume_pdf_parse()
    test_generate_questions_with_resume(parsed_resume)
    print("\nALL FEATURE TESTS COMPLETED SUCCESSFULLY!")
