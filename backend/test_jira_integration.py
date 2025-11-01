"""
Script to test Jira issue creation via REST API using environment variables and explicit headers mirroring curl.

Before running:
  - Ensure dependencies are installed: pip install requests
  - Set the following environment variables:
      JIRA_BASE_URL       (e.g., https://your-domain.atlassian.net/rest/api/2/issue)
      JIRA_EMAIL          (your Atlassian account email)
      JIRA_API_TOKEN      (your Jira API token)
      JIRA_PROJECT_KEY    (the target Jira project key)
      OPTIONAL: JIRA_XSRF_TOKEN (the atlassian.xsrf.token cookie value)
      OPTIONAL: JIRA_ISSUE_TYPE (e.g., 'Bug', 'Story', default 'Story')
      OPTIONAL: JIRA_ISSUE_SUMMARY (default 'Test issue from script')
      OPTIONAL: JIRA_ISSUE_DESCRIPTION (default 'Created via REST API')
"""
import os
import json
import base64
import requests

# ---------- Configuration from environment ----------
BASE_URL = os.getenv("JIRA_BASE_URL")
EMAIL = os.getenv("JIRA_EMAIL")
API_TOKEN = os.getenv("JIRA_API_TOKEN")
PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")
XSRF_TOKEN = os.getenv("JIRA_XSRF_TOKEN")

# Optional ticket details
ISSUE_TYPE = os.getenv("JIRA_ISSUE_TYPE", "Story")
ISSUE_SUMMARY = os.getenv("JIRA_ISSUE_SUMMARY", "Test issue from script")
ISSUE_DESCRIPTION = os.getenv("JIRA_ISSUE_DESCRIPTION", "Created via REST API")

# Validate required environment variables
required = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_PROJECT_KEY"]
missing = [var for var in required if not os.getenv(var)]
if missing:
    raise SystemExit(f"Missing required environment variables: {', '.join(missing)}")

# ---------- Issue payload ----------
payload = {
    "fields": {
        "project": {"key": PROJECT_KEY},
        "summary": ISSUE_SUMMARY,
        "description": ISSUE_DESCRIPTION,
        "issuetype": {"name": ISSUE_TYPE}
    }
}

# ---------- Headers ----------
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}
# Basic auth
credentials = f"{EMAIL}:{API_TOKEN}"
encoded = base64.b64encode(credentials.encode()).decode()
headers["Authorization"] = f"Basic {encoded}"
# Optional XSRF
if XSRF_TOKEN:
    headers["Cookie"] = f"atlassian.xsrf.token={XSRF_TOKEN}"

# ---------- Request ----------
response = requests.post(BASE_URL, headers=headers, json=payload)

# ---------- Output ----------
print(f"Status: {response.status_code}")
try:
    print(json.dumps(response.json(), indent=2))
except ValueError:
    print(response.text)
