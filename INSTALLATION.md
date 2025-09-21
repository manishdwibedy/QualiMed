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

The most secure way to use your API key for local testing is through the application's UI:

1.  Click **"Advanced Settings"** to expand the panel.
2.  Under **"Model Configuration"**, select `Google Gemini`.
3.  Paste your API key into the input field that says "Enter your Gemini API Key".

The application is now ready to generate test cases using the Gemini API.

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