from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest
from flask_cors import CORS
import json
import os
import base64
import requests
from pathlib import Path
import logging
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.application_default()
    firebase_admin.initialize_app(cred, {
        'projectId': 'simply-trade-4fbbd'
    })
db = firestore.client()

# Health check
@app.get("/health")
def health():
    logger.info(f"Health check requested from {request.remote_addr}")
    return jsonify({"status": "ok"}), 200


def validate_payload(required_fields):
    if not request.is_json:
        logger.warning(f"Invalid content-type: {request.content_type} from {request.remote_addr}")
        raise BadRequest("Request content-type must be application/json")
    data = request.get_json(silent=True)
    if data is None:
        logger.warning(f"Invalid JSON body from {request.remote_addr}")
        raise BadRequest("Invalid JSON body")
    missing = [f for f in required_fields if f not in data]
    if missing:
        logger.warning(f"Missing required fields: {', '.join(missing)} from {request.remote_addr}")
        raise BadRequest(f"Missing required fields: {', '.join(missing)}")
    return data


@app.post("/create/jira")
def create_jira_test_case():
    """Create an issue in Jira via REST API. Requires summary, description, and userId."""
    logger.info(f"Jira test case creation requested from {request.remote_addr}")
    try:
        # Validate that summary and description are provided
        data = validate_payload(["summary", "description"])
        # Get userId from payload or header
        user_id = data.get("userId") or request.headers.get("X-User-Id")
        if not user_id:
            raise BadRequest("Missing userId in payload or X-User-Id header")
        # Project key: payload or default env
        project_key = data.get("projectKey") or os.getenv("JIRA_PROJECT_KEY")
        if not project_key:
            raise BadRequest("Missing projectKey and no default JIRA_PROJECT_KEY is set")

        # Determine issue type (string or dict) or default
        raw_type = data.get("issuetype")
        if isinstance(raw_type, dict) and raw_type.get("name"):
            issue_type = {"name": raw_type["name"]}
        elif isinstance(raw_type, str):
            issue_type = {"name": raw_type}
        else:
            issue_type = {"name": os.getenv("JIRA_ISSUE_TYPE", "Story")}
        # Build Jira API payload
        jira_payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": data["summary"],
                "description": data["description"],
                "issuetype": issue_type
            }
        }
        # Fetch Jira credentials from Firestore
        doc_ref = db.collection('userSettings').document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise BadRequest("User settings not found")
        alm_settings = doc.to_dict().get('almSettings', {})
        jira_creds = alm_settings.get('jira', {})
        base_url = jira_creds.get("instanceUrl")
        email = jira_creds.get("userEmail")
        api_token = jira_creds.get("apiToken")

        logger.info(f"ALM settings: {alm_settings}")
        logger.info(f"Jira creds: {jira_creds}")
        logger.info(f"Base URL: {base_url}, Email: {email}, API Token: {'present' if api_token else 'missing'}")
        if not (base_url and email and api_token):
            raise BadRequest("Jira credentials not configured in Firestore")

        # Prepare Basic auth header
        auth_str = f"{email}:{api_token}"
        token = base64.b64encode(auth_str.encode()).decode()
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {token}"
        }
        # Send request
        url = base_url.rstrip("/") + "/rest/api/2/issue"
        logger.info(f"Sending request to Jira API: {url}")
        resp = requests.post(url, headers=headers, json=jira_payload)
        try:
            resp_json = resp.json()
        except ValueError:
            resp_json = {"raw": resp.text}
        logger.info(f"Jira API response: {resp_json}")
        logger.info(f"Jira API response status: {resp.status_code}")
        logger.info(f"Jira API jira_payload: {jira_payload}")
        return jsonify({"status_code": resp.status_code, "response": resp_json}), resp.status_code
    except Exception as e:
        logger.error(f"Error creating Jira test case: {str(e)}")
        raise


@app.post("/create/polarion")
def create_polarion_test_case():
    logger.info(f"Polarion test case creation requested from {request.remote_addr}")
    try:
        data = validate_payload(["projectId", "title", "description"])
        result = {
            "system": "polarion",
            "projectId": data["projectId"],
            "title": data["title"],
            "id": "POL-001",
            "status": "created"
        }
        logger.info(f"Polarion test case created: {result['id']}")
        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error creating Polarion test case: {str(e)}")
        raise


@app.post("/create/azure")
def create_azure_devops_test_case():
    logger.info(f"Azure DevOps test case creation requested from {request.remote_addr}")
    try:
        data = validate_payload(["organization", "project", "title"])
        result = {
            "system": "azure-devops",
            "organization": data["organization"],
            "project": data["project"],
            "title": data["title"],
            "id": "AZ-1001",
            "status": "created"
        }
        logger.info(f"Azure DevOps test case created: {result['id']}")
        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error creating Azure DevOps test case: {str(e)}")
        raise



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting Flask app on host 0.0.0.0 port {port}")
    app.run(host="0.0.0.0", port=port)
