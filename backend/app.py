from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest
import json
import os
import base64
import requests
from pathlib import Path
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Simple local credential store (JSON file)
CRED_DIR = Path(__file__).parent / "data"
CRED_FILE = CRED_DIR / "credentials.json"

def _ensure_store():
    CRED_DIR.mkdir(parents=True, exist_ok=True)
    if not CRED_FILE.exists():
        CRED_FILE.write_text(json.dumps({}), encoding="utf-8")

def _load_creds():
    _ensure_store()
    try:
        return json.loads(CRED_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}

def _save_creds(creds):
    _ensure_store()
    CRED_FILE.write_text(json.dumps(creds, indent=2), encoding="utf-8")

# Health check
@app.get("/health")
def health():
    logger.info(f"Health check requested from {request.remote_addr}")
    return jsonify({"status": "ok", "credentialStore": CRED_FILE.exists()}), 200


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
    """Create an issue in Jira via REST API. Requires summary and description; projectKey and issuetype optional."""
    logger.info(f"Jira test case creation requested from {request.remote_addr}")
    try:
        # Validate that summary and description are provided
        data = validate_payload(["summary", "description"])
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
            issue_type = {"name": os.getenv("JIRA_ISSUE_TYPE", "Bug")}
        # Build Jira API payload
        jira_payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": data["summary"],
                "description": data["description"],
                "issuetype": issue_type
            }
        }
        # Load Jira credentials from local store or env
        creds = _load_creds().get("jira", {})
        base_url = creds.get("baseUrl") or os.getenv("JIRA_BASE_URL")
        email = creds.get("email") or os.getenv("JIRA_EMAIL")
        api_token = creds.get("apiToken") or os.getenv("JIRA_API_TOKEN")
        if not (base_url and email and api_token):
            raise BadRequest("Jira credentials not configured")

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
        logger.info(f"Jira API response status: {resp.status_code}")
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


# Credential endpoints
@app.post("/credentials/jira")
def save_jira_credentials():
    logger.info(f"Jira credentials save requested from {request.remote_addr}")
    try:
        data = validate_payload(["baseUrl", "email", "apiToken"])
        creds = _load_creds()
        creds["jira"] = {"baseUrl": data["baseUrl"], "email": data["email"], "apiToken": data["apiToken"]}
        _save_creds(creds)
        logger.info("Jira credentials saved successfully")
        return jsonify({"status": "saved", "system": "jira"}), 200
    except Exception as e:
        logger.error(f"Error saving Jira credentials: {str(e)}")
        raise

@app.post("/credentials/polarion")
def save_polarion_credentials():
    logger.info(f"Polarion credentials save requested from {request.remote_addr}")
    try:
        data = validate_payload(["baseUrl", "username", "password"])
        creds = _load_creds()
        creds["polarion"] = {"baseUrl": data["baseUrl"], "username": data["username"], "password": data["password"]}
        _save_creds(creds)
        logger.info("Polarion credentials saved successfully")
        return jsonify({"status": "saved", "system": "polarion"}), 200
    except Exception as e:
        logger.error(f"Error saving Polarion credentials: {str(e)}")


@app.post("/credentials/azure")
def save_azure_credentials():
    logger.info(f"Azure credentials save requested from {request.remote_addr}")
    try:
        data = validate_payload(["organization", "personalAccessToken"])
        creds = _load_creds()
        creds["azure"] = {"organization": data["organization"], "personalAccessToken": data["personalAccessToken"]}
        _save_creds(creds)
        logger.info("Azure credentials saved successfully")
        return jsonify({"status": "saved", "system": "azure"}), 200
    except Exception as e:
        logger.error(f"Error saving Azure credentials: {str(e)}")
        raise
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting Flask app on host 0.0.0.0 port {port}")
    app.run(host="0.0.0.0", port=port)
