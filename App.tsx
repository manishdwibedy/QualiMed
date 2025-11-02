import React, { useState, useCallback, useEffect } from 'react';
import { RequirementInput } from './components/RequirementInput';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { Loader } from './components/Loader';
import { type TestCase, ALMStatus, ALMPlatform, type BatchFileStatus, type GenerationConfig, ModelProvider, type ModelConfig, DefaultTestCaseCategory } from './types';
import { generateTestCaseFromRequirement } from './services/geminiService';
import { FileIcon, FolderPlusIcon } from './components/Icons';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { BatchStatusDisplay } from './components/BatchStatusDisplay';
import { useAuth } from './components/AuthProvider';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { enableAuth } from './config';
import { loadAlmSettings, AlmSettings, loadApiSettings, ApiSettings } from './services/settingsService';
import { logAnalyticsEvent } from './services/analyticsService';

// Configure the PDF.js worker to enable text extraction.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

const DEFAULT_SYSTEM_INSTRUCTION = `You are an expert Software Quality Assurance Engineer specializing in mission-critical healthcare systems.
Your task is to analyze the software requirements provided in the user's prompt.
From the provided materials, identify all individual functional requirements. For each requirement found, generate a comprehensive suite of test cases that includes scenarios for each of the user-defined categories.

You can add constraints for the model by adding them here. For example: "Do not include performance test cases."

Strictly adhere to the provided JSON schema for your response. The schema details all the required and optional fields for each test case.
Populate the 'action', 'expectedOutcome', 'preConditions', and 'testData' fields with markdown-formatted text for enhanced readability, as suggested in the schema descriptions.`;


const AppContent: React.FC = () => {
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [almSettingsData, apiSettingsData] = await Promise.all([
          loadAlmSettings(),
          loadApiSettings(),
        ]);
        setAlmSettings(almSettingsData);
        setApiSettings(apiSettingsData);
        // Update modelConfig and generationConfig with loaded API settings
        setModelConfig(prev => ({
          ...prev,
          provider: apiSettingsData.provider,
          apiKey: apiSettingsData.geminiApiKey,
          ollamaUrl: apiSettingsData.ollamaUrl,
          ollamaModel: apiSettingsData.ollamaModel,
        }));
        setGenerationConfig(prev => ({
          ...prev,
          temperature: apiSettingsData.temperature,
          maxOutputTokens: apiSettingsData.maxOutputTokens,
          topP: apiSettingsData.topP,
        }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);
  const [requirement, setRequirement] = useState<string>('The system shall allow a user to log in with a valid username and password. Upon successful authentication, the user should be redirected to their dashboard.');
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [almPlatform, setAlmPlatform] = useState<ALMPlatform>(ALMPlatform.JIRA);

  const [almSettings, setAlmSettings] = useState<AlmSettings>({
    jira: { instanceUrl: '', userEmail: '', apiToken: '', projectKey: '' },
    azureDevOps: { organization: '', project: '', personalAccessToken: '', workItemType: 'Test Case' },
    polarion: { serverUrl: '', username: '', password: '', projectId: '' },
  });
  
  // State for batch processing, tracking each file's status
  const [batchStatus, setBatchStatus] = useState<BatchFileStatus[]>([]);

  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    temperature: 0.4,
    maxOutputTokens: 1000,
    topP: 1,
    categories: Object.values(DefaultTestCaseCategory),
  });

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: ModelProvider.GEMINI,
    apiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    provider: ModelProvider.GEMINI,
    geminiApiKey: '',
    ollamaUrl: '',
    ollamaModel: '',
    temperature: 0.4,
    maxOutputTokens: 1000,
    topP: 1,
  });

  const handleRequirementChange = (newRequirement: string) => {
    setRequirement(newRequirement);
    if (testCases || error || batchStatus.length > 0) {
      setTestCases(null);
      setError(null);
      setBatchStatus([]);
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (testCases || error || batchStatus.length > 0) {
      setTestCases(null);
      setError(null);
      setBatchStatus([]);
    }
  };


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
    logAnalyticsEvent('generate_test_cases_start', {
      has_requirement: !!requirement.trim(),
      file_count: files.length,
      model_provider: modelConfig.provider
    });
    setIsLoading(true);
    setError(null);
    setTestCases(null);

    // Reload API settings before generation to ensure latest values
    const latestApiSettings = await loadApiSettings();
    setApiSettings(latestApiSettings);

    // Merge API settings into model config for generation
    const effectiveModelConfig: ModelConfig = {
      provider: latestApiSettings.provider,
      apiKey: latestApiSettings.geminiApiKey,
      ollamaUrl: latestApiSettings.ollamaUrl,
      ollamaModel: latestApiSettings.ollamaModel,
    };

    // Update generation config with latest settings
    setGenerationConfig(prev => ({
      ...prev,
      temperature: latestApiSettings.temperature,
      maxOutputTokens: latestApiSettings.maxOutputTokens,
      topP: latestApiSettings.topP,
    }));

    const effectiveGenerationConfig: GenerationConfig = {
      ...generationConfig,
      temperature: latestApiSettings.temperature,
      maxOutputTokens: latestApiSettings.maxOutputTokens,
      topP: latestApiSettings.topP,
    };

    const initialStatus: BatchFileStatus[] = files.map(f => ({ name: f.name, status: 'pending' }));
    if (files.length === 0 && requirement.trim()) {
        initialStatus.push({ name: 'Text Input', status: 'pending' });
    }
    setBatchStatus(initialStatus);

    const allGeneratedTestCases: TestCase[] = [];

    for (const file of files) {
      setBatchStatus(prev => prev.map(s => s.name === file.name ? { ...s, status: 'processing' } : s));
      try {
        const documentText = await parseFile(file);
        const generatedData = await generateTestCaseFromRequirement(requirement, documentText, effectiveGenerationConfig, effectiveModelConfig);
        
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
        setBatchStatus(prev => prev.map(s => s.name === file.name ? { ...s, status: 'success', generatedCount: newTestCases.length } : s));
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Failed to process ${file.name}:`, e);
        setBatchStatus(prev => prev.map(s => s.name === file.name ? { ...s, status: 'error', message: errorMessage } : s));
      }
    }
    
    // If there's only text and no files, generate from that
    if(files.length === 0 && requirement.trim()) {
        const name = 'Text Input';
        setBatchStatus(prev => prev.map(s => s.name === name ? { ...s, status: 'processing' } : s));
        try {
            const generatedData = await generateTestCaseFromRequirement(requirement, null, effectiveGenerationConfig, effectiveModelConfig);
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
            setBatchStatus(prev => prev.map(s => s.name === name ? { ...s, status: 'success', generatedCount: newTestCases.length } : s));
        } catch (e)
         {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            // Set error on the main display AND the batch status
            setError(`Failed to generate test cases. ${errorMessage}`);
            setBatchStatus(prev => prev.map(s => s.name === name ? { ...s, status: 'error', message: errorMessage } : s));
        }
    }

    setTestCases(allGeneratedTestCases);
    setIsLoading(false);
    logAnalyticsEvent('generate_test_cases_complete', {
      test_case_count: allGeneratedTestCases.length,
      file_count: files.length,
      has_errors: batchStatus.some(s => s.status === 'error')
    });
  }, [requirement, files, generationConfig, modelConfig]);
  
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
    logAnalyticsEvent('export_test_cases', { format: 'json', count: testCases.length });
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
    logAnalyticsEvent('export_test_cases', { format: 'markdown', count: testCases.length });
  }, [testCases]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <FolderPlusIcon className="w-12 h-12 text-sky-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
              QualiMed
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Generate comprehensive test cases from software requirements using AI.
          </p>
        </header>

        <main className="space-y-8">
          <RequirementInput
            requirement={requirement}
            setRequirement={handleRequirementChange}
            onGenerate={handleStartBatchGeneration}
            isLoading={isLoading}
            files={files}
            onFilesChange={handleFilesChange}
            generationConfig={generationConfig}
            onGenerationConfigChange={setGenerationConfig}
            modelConfig={modelConfig}
            onModelConfigChange={setModelConfig}
            apiSettings={apiSettings}
          />
          
          {batchStatus.length > 0 && <BatchStatusDisplay status={batchStatus} isProcessing={isLoading} />}

          {error && !isLoading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {testCases && !isLoading && (
            <TestCaseDisplay
              testCases={testCases}
              onAlmStatusUpdate={handleAlmStatusUpdate}
              onTestCaseUpdate={handleTestCaseUpdate}
              onExportJson={handleExportJson}
              onExportMarkdown={handleExportMarkdown}
              almPlatform={almPlatform}
              onAlmPlatformChange={setAlmPlatform}
              jiraConfig={almSettings.jira}
              azureDevOpsConfig={almSettings.azureDevOps}
              polarionConfig={almSettings.polarion}
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

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    console.log(user);
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (enableAuth && !user) {
    return <Login />;
  }

  return <AppContent />;
};

export default App;
