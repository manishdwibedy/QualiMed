export enum DefaultTestCaseCategory {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  EDGE_CASE = 'Edge Case',
}

export type TestCaseCategory = string;

export enum ALMPlatform {
  JIRA = 'Jira',
  POLARION = 'Polarion',
  AZURE_DEVOPS = 'Azure DevOps',
}

export interface TestCase {
  id: string;
  title: string;
  requirement: string;
  category: TestCaseCategory;
  steps: TestStep[];
  expectedResult: string;
  preConditions?: string;
  testData?: string;
  sourceFile?: string;
  almStatus: ALMStatus;
  almIssueKey?: string | null;
  almError?: string | null;
}

export interface TestStep {
  step: number;
  actor: string;
  action: string;
}

export interface GeneratedTestCaseData {
  category: TestCaseCategory;
  actor: string;
  action: string;
  expectedOutcome: string;
  title: string;
  preConditions?: string;
  testData?: string;
}

export enum ALMStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface BatchReport {
  success: { file: string; count: number }[];
  failed: { file: string; reason: string }[];
}

export interface BatchFileStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  generatedCount?: number;
}

export interface GenerationConfig {
  systemInstruction: string;
  temperature: number;
  topK: number;
  topP: number;
  categories: string[];
}

export enum ModelProvider {
  GEMINI = 'Google Gemini',
  OLLAMA = 'Ollama (Local)',
}

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
}

export interface ApiSettings {
  provider: ModelProvider;
  geminiApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  temperature: number;
  topK: number;
  topP: number;
}
