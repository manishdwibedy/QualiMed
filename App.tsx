
import React, { useState, useCallback } from 'react';
import { RequirementInput } from './components/RequirementInput';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { Loader } from './components/Loader';
import { type TestCase, JiraStatus } from './types';
import { generateTestCaseFromRequirement } from './services/geminiService';
import { FileIcon } from './components/Icons';

const App: React.FC = () => {
  const [requirement, setRequirement] = useState<string>('For the attached document, generate test cases for the user login requirements listed in section 2.1.');
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<{ mimeType: string, data: string } | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileData({
          mimeType: selectedFile.type,
          data: base64String,
        });
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
        setFile(null);
        setFileData(null);
      }
      reader.readAsDataURL(selectedFile);
    } else {
      setFileData(null);
    }
  };


  const handleGenerateTestCase = useCallback(async () => {
    if (!requirement.trim() && !file) {
      setError('A requirement description or an uploaded document is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTestCases(null);

    try {
      const generatedData = await generateTestCaseFromRequirement(requirement, fileData);
      
      const newTestCases: TestCase[] = generatedData.map((data, index) => ({
        id: `TC-${Date.now()}-${index}`,
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
  }, [requirement, fileData, file]);
  
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
