import React, { useState, useCallback } from 'react';
import { RequirementInput } from './components/RequirementInput';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { Loader } from './components/Loader';
import { type TestCase, JiraStatus } from './types';
import { generateTestCaseFromRequirement } from './services/geminiService';
import { FileIcon } from './components/Icons';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure the PDF.js worker to enable text extraction.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const [requirement, setRequirement] = useState<string>('The system shall allow a user to log in with a valid username and password. Upon successful authentication, the user should be redirected to their dashboard.');
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);


  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setDocumentText(null);
    if (selectedFile) {
      setIsParsing(true);
      setError(null);
      try {
        let text = '';
        const arrayBuffer = await selectedFile.arrayBuffer();

        if (selectedFile.type === 'application/pdf') {
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // We have to use a type assertion here because the pdf.js types are not fully exposed.
                text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
            }
        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
        }
        setDocumentText(text);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to parse file: ${errorMessage}`);
        setFile(null);
        setDocumentText(null);
      } finally {
        setIsParsing(false);
      }
    }
  }, []);


  const handleGenerateTestCase = useCallback(async () => {
    if (!requirement.trim() && !file) {
      setError('A requirement description or an uploaded document is required.');
      return;
    }
    if(isParsing) {
      setError('Please wait for the document to finish parsing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTestCases(null);

    try {
      const generatedData = await generateTestCaseFromRequirement(requirement, documentText);
      
      const newTestCases: TestCase[] = generatedData.map((data) => ({
        id: `TC-${crypto.randomUUID()}`,
        title: data.title,
        requirement: requirement,
        category: data.category,
        steps: [
          { step: 1, actor: data.actor, action: data.action },
        ],
        expectedResult: data.expectedOutcome,
        preConditions: data.preConditions,
        testData: data.testData,
        jiraStatus: JiraStatus.IDLE,
      }));
      setTestCases(newTestCases);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate test cases. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [requirement, documentText, file, isParsing]);
  
  const handleJiraStatusUpdate = (testCaseId: string, status: JiraStatus, result?: { issueKey?: string, error?: string }) => {
    setTestCases(prevTestCases => {
      if (!prevTestCases) return null;
      return prevTestCases.map(tc => 
        tc.id === testCaseId 
          ? { 
              ...tc, 
              jiraStatus: status,
              jiraIssueKey: result?.issueKey || tc.jiraIssueKey,
              jiraError: result?.error || tc.jiraError,
           } 
          : tc
      );
    });
  };

  const handleTestCaseUpdate = (updatedTestCase: TestCase) => {
    setTestCases(prevTestCases => {
        if (!prevTestCases) return null;
        return prevTestCases.map(tc =>
            tc.id === updatedTestCase.id ? updatedTestCase : tc
        );
    });
  };

  const triggerDownload = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = useCallback(() => {
    if (!testCases || testCases.length === 0) return;
    const jsonString = JSON.stringify(testCases, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    triggerDownload(`test-cases-${Date.now()}.json`, blob);
  }, [testCases]);

  const handleExportMarkdown = useCallback(() => {
    if (!testCases || testCases.length === 0) return;
    
    const markdownString = testCases.map(tc => {
      let content = `
# ${tc.title} (${tc.id})

**Category:** ${tc.category}

`;

      if (tc.preConditions) {
        content += `
## Pre-Conditions

${tc.preConditions}
`;
      }

      content += `
## Test Steps

| Step | Actor | Action |
|------|-------|--------|
`;
      tc.steps.forEach(step => {
        content += `| ${step.step} | ${step.actor} | ${step.action.replace(/\n/g, '<br />')} |\n`;
      });

      if (tc.testData) {
        content += `
## Test Data

${tc.testData}
`;
      }

      content += `
## Expected Result

${tc.expectedResult}
`;
      return content;
    }).join('\n---\n');

    const blob = new Blob([markdownString], { type: 'text/markdown' });
    triggerDownload(`test-cases-${Date.now()}.md`, blob);
  }, [testCases]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <FileIcon className="w-12 h-12 text-sky-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
              Health-Tech Test Case Generator
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Upload a requirements document (PDF, Word) or enter text to generate a comprehensive suite of test cases.
          </p>
        </header>

        <main className="space-y-8">
          <RequirementInput
            requirement={requirement}
            setRequirement={setRequirement}
            onGenerate={handleGenerateTestCase}
            isLoading={isLoading}
            isParsing={isParsing}
            file={file}
            onFileChange={handleFileChange}
          />

          {isLoading && <Loader />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {testCases && (
            <TestCaseDisplay 
              testCases={testCases} 
              onJiraStatusUpdate={handleJiraStatusUpdate} 
              onTestCaseUpdate={handleTestCaseUpdate}
              onExportJson={handleExportJson}
              onExportMarkdown={handleExportMarkdown}
            />
          )}
        </main>
        
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-600">
          <p>Powered by Google Gemini API & React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
