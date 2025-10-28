# Local Installation Guide (macOS)

This guide provides step-by-step instructions to set up and run the QualiMed application on your MacBook.

The guide is divided into two parts:
- **Part A**: Deploying the application with the default Google Gemini API.
- **Part B**: Configuring the application to use local LLMs via Ollama.

---

### Part A: Deploying the Application

Follow these steps to get the application running on your machine.

#### **Prerequisites**

- **Node.js**: Ensure you have Node.js (which includes `npm`) installed. You can download it from [nodejs.org](https://nodejs.org/). Verify by running `node -v` in your terminal.
- **Code Editor**: A code editor like [Visual Studio Code](https://code.visualstudio.com/) is recommended.
- **Google Gemini API Key**:
    1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    2.  Click "**Create API key**" and copy the key.

#### **Step 1: Project Setup**

1.  Create a new folder for the project on your machine (e.g., `qualimed`).
2.  Inside this folder, create the complete directory structure and all the files provided by the application (`App.tsx`, `index.html`, `components/RequirementInput.tsx`, etc.).
3.  Copy and paste the content for each file into its corresponding newly created file.

#### **Step 2: Dependencies**

This project uses an **import map** in `index.html` to load dependencies directly from a CDN. This means **no `npm install` step is required**. All necessary libraries like React and `@google/genai` are fetched by the browser automatically.

#### **Step 3: Run the Local Server**

Because this is a modern web application using ES modules, you need to serve it from a local web server.

1.  Open the Terminal application.
2.  Navigate to your project directory:
    ```bash
    cd path/to/your/qualimed
    ```
3.  Use `npx` to run a simple, temporary web server:
    ```bash
    npx serve
    ```
4.  Terminal will show a message like `Accepting connections at http://localhost:3000`.
5.  Open your web browser and navigate to **http://localhost:3000**.

The application should now be running! By default, it's configured to use Google Gemini. You will need to provide your API key via the UI to use it.

#### **Step 4: Provide Your Gemini API Key**

You can provide your API key for local testing is through the application's UI:

1.  Click **"Advanced Settings"** to expand the panel.
2.  Under **"Model Configuration"**, select `Google Gemini`.
3.  Paste your API key into the input field that says "Enter your Gemini API Key".

The application is now ready to generate test cases using the Gemini API.

#### **Step 5: Configure ALM Integrations (Optional)**

QualiMed supports integration with ALM tools like Jira and Azure DevOps. You can configure these directly in the dashboard:

1.  After generating test cases, select your desired ALM platform from the dropdown (Jira, Azure DevOps, etc.).
2.  Fill in the configuration form that appears with your credentials:
    - **Jira**: Instance URL, User Email, API Token, Project Key
    - **Azure DevOps**: Organization, Project, Personal Access Token, Work Item Type
3.  Click "Create Ticket" on individual test cases to push them to your ALM system.

**Note**: Credentials are stored temporarily in your browser session and not persisted. For production use, consider secure credential management.

QualiMed supports integration with ALM (Application Lifecycle Management) tools like Jira, Polarion, and Azure DevOps to create test cases directly in these systems.

1.  Copy `config.example.ts` to `config.ts` in the project root.
2.  Fill in your credentials for the desired ALM platforms:

    **Jira Configuration:**
    - `instanceUrl`: Your Jira instance URL (e.g., `https://mycompany.atlassian.net`)
    - `userEmail`: Your Jira account email
    - `apiToken`: Generate an API token from your Atlassian account settings
    - `projectKey`: The key of the project where test cases will be created (e.g., `PROJ`)

    **Polarion Configuration:**
    - `serverUrl`: Your Polarion server URL (e.g., `https://polarion.mycompany.com`)
    - `username`: Your Polarion username
    - `password`: Your Polarion password
    - `projectId`: The ID of the project where work items will be created (e.g., `HealthApp`)

    **Azure DevOps Configuration:**
    - `organization`: Your Azure DevOps organization name (e.g., `myorg`)
    - `project`: The name of the project where work items will be created (e.g., `MyProject`)
    - `personalAccessToken`: Generate a Personal Access Token from Azure DevOps settings
    - `workItemType`: The type of work item to create (e.g., `Test Case`)

3.  Ensure `config.ts` is added to your `.gitignore` to prevent committing sensitive information.
4.  In the application UI, when viewing generated test cases, select the desired ALM platform and click "Create Ticket" to integrate with your configured ALM system.

---

### Part B: Using Local LLMs with Ollama

This section explains how to connect the application to a locally running Ollama instance, allowing you to use models like `gemma` or `tinyllama`.

#### **Prerequisites**

- **Ollama**: Download and install the Ollama application for macOS from [ollama.com](https://ollama.com). The installer will set it up as a background service.

#### **Step 1: Download Local Models**

1.  After installing Ollama, open your Terminal.
2.  Use the `ollama pull` command to download the models you wish to use. For example:
    ```bash
    # For Google's Gemma model
    ollama pull gemma

    # For a smaller, faster model
    ollama pull tinyllama
    ```
3.  You can see all your installed models by running `ollama list`.

#### **Step 2: Configure the App for Ollama**

1.  In your browser where the app is running (`http://localhost:3000`), expand the **"Advanced Settings"** panel.
2.  Find the **"Model Configuration"** section.
3.  Select the **Ollama (Local)** radio button.
4.  Two fields will appear:
    - **Server URL**: The default value `http://localhost:11434` is correct for most standard Ollama installations.
    - **Model Name**: Enter the name of the model you downloaded, e.g., `gemma` or `tinyllama`.
5.  You are now configured to use your local model! Enter a requirement and click "Generate Test Suite" to send the request to your local Ollama instance.

#### **Troubleshooting & Tweaking**

- If you get errors, check the logs from the Ollama application (accessible via the macOS menu bar icon) to see if it's receiving requests correctly.
- Smaller models may require more explicit instructions. If you get malformed responses, try simplifying the prompt in the **"System Instruction"** text area. See the main `README.md` for an example.

---

### Part C: Handling CORS Issues with ALM Integrations

When integrating with external ALM systems like Jira, you may encounter Cross-Origin Resource Sharing (CORS) errors in the browser console. This is a security feature that prevents web applications from making requests to different domains.

#### **CORS Browser Extension (Recommended for Development)**

For development and testing purposes, you can use a browser extension to bypass CORS restrictions:

##### **Chrome/Chromium Browsers:**
1. Install the "CORS Unblock" extension from the Chrome Web Store: https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino
2. Click the extension icon in your browser toolbar to enable it (it should turn green)
3. Refresh the QualiMed application page
4. The extension will now allow cross-origin requests to Jira and other ALM APIs

##### **Firefox:**
1. Install the "CORS Everywhere" extension from Firefox Add-ons: https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/
2. Click the extension icon to enable it
3. Refresh the QualiMed application page

##### **Safari:**
1. Safari doesn't have direct CORS extensions, but you can enable developer mode:
   - Go to Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"
   - In the Develop menu, enable "Disable Cross-Origin Restrictions"

#### **Alternative Solutions**

- **Backend Proxy**: For production deployments, implement a backend server that proxies API requests to ALM systems, avoiding CORS entirely.
- **Simulated Mode**: Use the application's simulated ALM integration for testing UI workflows without real API calls.
- **Local Development Server**: Run the application with `npm run dev -- --host` to access it from different origins if needed.

#### **Testing CORS Fix**

After installing and enabling the CORS extension:
1. Open the QualiMed application
2. Select "Jira" as the ALM platform
3. Fill in your Jira credentials in the configuration form
4. Generate test cases and try creating a Jira ticket
5. Check the browser console - CORS errors should no longer appear

**Note**: CORS extensions should only be used for development. Remove or disable them when browsing other websites for security reasons.
