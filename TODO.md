# TODO: Add Logging for Jira Credentials Debugging

- [x] Replace print(alm_settings) with logger.info(f"ALM settings: {alm_settings}")
- [x] Add logger.info(f"Jira creds: {jira_creds}")
- [x] Add logger.info(f"Base URL: {base_url}, Email: {email}, API Token: {'present' if api_token else 'missing'}")
