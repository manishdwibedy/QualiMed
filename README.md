
# Health-Tech Test Case Generator

This application is a powerful tool designed to accelerate the software quality assurance process in the health-tech industry. It leverages Large Language Models (LLMs) to automatically generate comprehensive test case suites from software requirement documents or plain text descriptions.

## Key Features

- **Multi-Format Input**: Generate test cases from plain text descriptions or by uploading requirement documents in PDF or DOCX format.
- **Batch Processing**: Upload and process multiple requirement documents simultaneously, with real-time progress tracking for each file.
- **Flexible AI Backend**:
    - **Google Gemini**: Connects to the powerful Gemini API for high-quality test case generation.
    - **Local LLMs**: Supports integration with a local [Ollama](https://ollama.com/) instance, allowing you to use models like `gemma`, `llama3`, or `tinyllama` for offline and private generation.
- **Advanced Customization**:
    - **System Prompt**: Edit the full system instruction to fine-tune the AI's persona, constraints, and output style.
    - **Model Parameters**: Adjust Temperature, Top-K, and Top-P to control the creativity and determinism of the AI's responses.
- **ALM Integration (Simulated)**: Simulate creating tickets in popular Application Lifecycle Management (ALM) platforms like Jira, Polarion, and Azure DevOps.
- **Interactive UI**:
    - **Editable Test Cases**: Review and modify generated test cases directly in the user interface before exporting.
    - **Clear Feedback**: Get immediate visual feedback on file uploads, rejections, and batch processing status.
- **Export Options**: Export the complete test case suite to **JSON** or **Markdown** for easy integration into your existing workflows.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Integration**:
    - `@google/genai` for the Google Gemini API
    - Standard `fetch` API for Ollama integration
- **File Parsing**: `pdf.js`, `mammoth.js`
- **UI Components**: `react-dropzone`, `react-markdown`

## Getting Started

To run this application on your local machine, please follow the detailed steps in the **[INSTALLATION.md](./INSTALLATION.md)** guide. The guide covers everything from project setup to configuring local AI models.

## How to Use the Application

1.  **Provide Context**: Enter a general requirement or prompt in the "Requirement Context" text area. This context will be applied to all documents you upload.
2.  **Upload Documents**: Drag and drop PDF or DOCX files into the upload area, or click to select them.
3.  **(Optional) Configure Advanced Settings**:
    - Click **"Advanced Settings"** to expand the panel.
    - **Choose a Model**: Select between `Google Gemini` (default) or `Ollama (Local)`.
        - If using **Gemini**, you can enter your personal API key (optional).
        - If using **Ollama**, ensure the server URL is correct and enter the name of the local model you want to use (e.g., `gemma`).
    - **Customize Prompt**: Modify the "System Instruction" to guide the AI's behavior.
    - **Adjust Parameters**: Use the sliders to change the Temperature, Top-K, and Top-P values.
4.  **Generate**: Click the **"Start Batch Generation"** button.
5.  **Review**: The application will display the status of each file as it's processed. Once complete, a summary report will appear, and the generated test cases will be displayed below, grouped by their source file.
6.  **Edit & Export**: You can edit individual test cases by clicking the pencil icon. When ready, use the export buttons to save your test suite as a JSON or Markdown file.

## Customizing for Local Models (Gemma, TinyLlama)

When using smaller local models via Ollama, you may need to adjust the system prompt for best results. These models sometimes struggle with complex instructions or strict JSON formatting.

**Tip**: If a model like `tinyllama` fails to produce valid JSON, make the prompt more direct.

*Example Tweak for the System Instruction:*
```
You are a helpful assistant. Your only job is to create test cases.
You MUST respond with a valid JSON array and nothing else.
Do not add any extra text, explanations, or markdown code fences.
The JSON must follow this structure: [{ "title": "...", "category": "...", ... }]
```
