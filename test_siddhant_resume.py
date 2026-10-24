import os
import sys
import json
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

with open('Siddhant_Salunkhe_Resume.pdf', 'rb') as f:
    pdf_bytes = f.read()

res = client.post('/api/resume/parse', files={'file': ('Siddhant_Salunkhe_Resume.pdf', pdf_bytes, 'application/pdf')})
print('PARSER STATUS:', res.status_code)
data = res.json()
print('Candidate Name:', data.get('candidate_name'))
print('Candidate Email:', data.get('candidate_email'))
print('Inferred Role:', data.get('inferred_role'))
print('Key Skills:', data.get('key_skills'))
print('Summary:', data.get('experience_summary'))

# Test Question Generation grounded in Siddhant's resume
config = {
    'mode': 'interview',
    'domain': data.get('inferred_domain', 'Software Engineering'),
    'company': 'Google',
    'role': data.get('inferred_role', 'Full-Stack Web Developer'),
    'difficulty': 'medium',
    'numQuestions': 3,
    'durationMin': 15,
    'strictMode': True,
    'candidate_name': data.get('candidate_name'),
    'candidate_email': data.get('candidate_email'),
    'resume_text': data.get('resume_text'),
    'resume_skills': data.get('key_skills'),
    'resume_filename': 'Siddhant_Salunkhe_Resume.pdf'
}

q_res = client.post('/api/questions', json={'config': config})
print('\nGENERATED INTERVIEW QUESTIONS FOR SIDDHANT SALUNKHE:')
for q in q_res.json().get('items', []):
    print(f"- [{q.get('type')}]: {q.get('text')}")
