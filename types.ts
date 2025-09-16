
export enum TestCaseCategory {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  EDGE_CASE = 'Edge Case',
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
  jiraStatus: JiraStatus;
  jiraIssueKey?: string | null;
  jiraError?: string | null;
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

export enum JiraStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
