import React, { useState, useCallback } from 'react';
import { RequirementInput } from './components/RequirementInput';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { Loader } from './components/Loader';
import { type TestCase, ALMStatus, ALMPlatform, type BatchReport } from './types';
import { generateTestCaseFromRequirement } from './services/geminiService';
import { FileIcon, FolderPlusIcon } from './components/Icons';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { BatchStatusDisplay } from './components/BatchStatusDisplay';

// Configure the PDF.js worker to enable text extraction.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const [requirement, setRequirement] = useState<string>('The system shall allow a user to log in with a valid username and password. Upon successful authentication, the user should be redirected to their dashboard.');
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [almPlatform, setAlmPlatform] = useState<ALMPlatform>(ALMPlatform.JIRA);
  
  // State for batch processing
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchProgress, setBatchProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [batchReport, setBatchReport] = useState<BatchReport | null>(null);

  const parseFile = async (file: File): Promise<string> => {
    let text = '';
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf') {
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // We have to use a type assertion here because the pdf.js types are not fully exposed.
            text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
    } else {
        throw new Error(`Unsupported file type: ${file.name}. Please upload PDF or DOCX files.`);
    }
    return text;
  };

  const handleStartBatchGeneration = useCallback(async () => {
    if (!requirement.trim() && files.length === 0) {
      setError('A requirement description or at least one document is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTestCases(null);
    setBatchReport(null);
    setBatchTotal(files.length);
    setBatchProgress(0);

    const allGeneratedTestCases: TestCase[] = [];
    const report: BatchReport = { success: [], failed: [] };

    for (const file of files) {
      setCurrentFile(file.name);
      setBatchProgress(prev => prev + 1);
      try {
        const documentText = await parseFile(file);
        const generatedData = await generateTestCaseFromRequirement(requirement, documentText);
        
        const newTestCases: TestCase[] = generatedData.map((data) => ({
          id: `TC-${crypto.randomUUID()}`,
          title: data.title,
          requirement: requirement,
          category: data.category,
          steps: [{ step: 1, actor: data.actor, action: data.action }],
          expectedResult: data.expectedOutcome,
          preConditions: data.preConditions,
          testData: data.testData,
          almStatus: ALMStatus.IDLE,
          sourceFile: file.name,
        }));
        allGeneratedTestCases.push(...newTestCases);
        report.success.push({ file: file.name, count: newTestCases.length });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Failed to process ${file.name}:`, e);
        report.failed.push({ file: file.name, reason: errorMessage });
      }
    }
    
    // If there's only text and no files, generate from that
    if(files.length === 0 && requirement.trim()) {
        setCurrentFile('Text Input');
        setBatchTotal(1);
        setBatchProgress(1);
        try {
            const generatedData = await generateTestCaseFromRequirement(requirement, null);
            const newTestCases: TestCase[] = generatedData.map((data) => ({
                id: `TC-${crypto.randomUUID()}`,
                title: data.title,
                requirement: requirement,
                category: data.category,
                steps: [{ step: 1, actor: data.actor, action: data.action }],
                expectedResult: data.expectedOutcome,
                preConditions: data.preConditions,
                testData: data.testData,
                almStatus: ALMStatus.IDLE,
                sourceFile: 'Text Input',
            }));
            allGeneratedTestCases.push(...newTestCases);
            report.success.push({ file: 'Text Input', count: newTestCases.length });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate test cases. ${errorMessage}`);
            report.failed.push({ file: 'Text Input', reason: errorMessage });
        }
    }

    setTestCases(allGeneratedTestCases);
    setBatchReport(report);
    setIsLoading(false);
    setCurrentFile(null);
  }, [requirement, files]);
  
  const handleAlmStatusUpdate = (testCaseId: string, status: ALMStatus, result?: { issueKey?: string, error?: string }) => {
    setTestCases(prevTestCases => {
      if (!prevTestCases) return null;
      return prevTestCases.map(tc => 
        tc.id === testCaseId 
          ? { 
              ...tc, 
              almStatus: status,
              almIssueKey: result?.issueKey || tc.almIssueKey,
              almError: result?.error || tc.almError,
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
**Source:** ${tc.sourceFile || 'N/A'}

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
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <FolderPlusIcon className="w-12 h-12 text-sky-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
              Health-Tech Test Case Generator
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Upload requirement documents (PDF, Word) or enter text to generate a comprehensive suite of test cases.
          </p>
        </header>

        <main className="space-y-8">
          <RequirementInput
            requirement={requirement}
            setRequirement={setRequirement}
            onGenerate={handleStartBatchGeneration}
            isLoading={isLoading}
            files={files}
            onFilesChange={setFiles}
          />

          {isLoading && <BatchStatusDisplay progress={batchProgress} total={batchTotal} currentFile={currentFile} />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {batchReport && !isLoading && <BatchStatusDisplay report={batchReport} />}


          {testCases && !isLoading && (
            <TestCaseDisplay 
              testCases={testCases} 
              onAlmStatusUpdate={handleAlmStatusUpdate} 
              onTestCaseUpdate={handleTestCaseUpdate}
              onExportJson={handleExportJson}
              onExportMarkdown={handleExportMarkdown}
              almPlatform={almPlatform}
              onAlmPlatformChange={setAlmPlatform}
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
