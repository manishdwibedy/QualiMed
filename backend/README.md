Backend (Flask) API

This folder contains a minimal Flask backend exposing endpoints to create test cases in different ALM systems and to save credentials locally. These endpoints validate input and return a mocked creation/ack response. Integrate each with the real system APIs (Jira, Polarion, Azure DevOps) as needed.

Endpoints
- GET /health — Simple health check
- POST /create/jira — Create a Jira test case
- POST /create/polarion — Create a Polarion test case
- POST /create/azure — Create an Azure DevOps test case
- POST /credentials/jira — Save Jira credentials locally
- POST /credentials/polarion — Save Polarion credentials locally
- POST /credentials/azure — Save Azure DevOps credentials locally

Run locally
1. Create a virtual environment and install dependencies:
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

2. Start the server:
   python app.py

3. Test with curl:
   curl -s http://localhost:5000/health

   # Create
   curl -s -X POST http://localhost:5000/create/jira \
     -H 'Content-Type: application/json' \
     -d '{"projectKey":"ABC","summary":"Sample","description":"Steps"}'

   curl -s -X POST http://localhost:5000/create/polarion \
     -H 'Content-Type: application/json' \
     -d '{"projectId":"QUALI","title":"Sample","description":"Details"}'

   curl -s -X POST http://localhost:5000/create/azure \
     -H 'Content-Type: application/json' \
     -d '{"organization":"org","project":"proj","title":"Sample"}'

   # Credentials
   curl -s -X POST http://localhost:5000/credentials/jira \
     -H 'Content-Type: application/json' \
     -d '{"baseUrl":"https://your-domain.atlassian.net","email":"user@example.com","apiToken":"TOKEN"}'

   curl -s -X POST http://localhost:5000/credentials/polarion \
     -H 'Content-Type: application/json' \
     -d '{"baseUrl":"https://polarion.example.com","username":"user","password":"secret"}'

   curl -s -X POST http://localhost:5000/credentials/azure \
     -H 'Content-Type: application/json' \
     -d '{"organization":"org","personalAccessToken":"PAT"}'

Security notes
- This simple credential store writes plaintext JSON to backend/data/credentials.json. Do not use in production.
- For production, use a proper secrets manager (e.g., Vault, AWS Secrets Manager, Azure Key Vault) and restrict filesystem permissions.
- Consider encrypting at rest and masking secrets in logs.
