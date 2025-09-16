
import React, { useState, useCallback } from 'react';
import { RequirementInput } from './components/RequirementInput';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { Loader } from './components/Loader';
import { type TestCase, JiraStatus } from './types';
import { generateTestCaseFromRequirement } from './services/geminiService';

const App: React.FC = () => {
  const [requirement, setRequirement] = useState<string>('The system shall allow a user to log in with a valid username and password.');
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTestCase = useCallback(async () => {
    if (!requirement.trim()) {
      setError('Requirement text cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTestCases(null);

    try {
      const generatedData = await generateTestCaseFromRequirement(requirement);
      
      const newTestCases: TestCase[] = generatedData.map((data, index) => ({
        id: `TC-${Date.now()}-${index}`,
        title: data.title,
        requirement: requirement,
        category: data.category,
        steps: [
          { step: 1, actor: data.actor, action: data.action },
        ],
        expectedResult: data.expectedOutcome,
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
  }, [requirement]);
  
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
            Health-Tech Test Case Generator
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Generate a comprehensive suite of test cases from a single software requirement using AI.
          </p>
        </header>

        <main className="space-y-8">
          <RequirementInput
            requirement={requirement}
            setRequirement={setRequirement}
            onGenerate={handleGenerateTestCase}
            isLoading={isLoading}
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
