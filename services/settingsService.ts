import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { ModelProvider } from '../types';

export interface AlmSettings {
  jira: {
    instanceUrl: string;
    userEmail: string;
    apiToken: string;
    projectKey: string;
  };
  azureDevOps: {
    organization: string;
    project: string;
    personalAccessToken: string;
    workItemType: string;
  };
  polarion: {
    serverUrl: string;
    username: string;
    password: string;
    projectId: string;
  };
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

const DEFAULT_ALM_SETTINGS: AlmSettings = {
  jira: {
    instanceUrl: '',
    userEmail: '',
    apiToken: '',
    projectKey: '',
  },
  azureDevOps: {
    organization: '',
    project: '',
    personalAccessToken: '',
    workItemType: 'Test Case',
  },
  polarion: {
    serverUrl: '',
    username: '',
    password: '',
    projectId: '',
  },
};

const DEFAULT_API_SETTINGS: ApiSettings = {
  provider: ModelProvider.GEMINI,
  geminiApiKey: '',
  ollamaUrl: '',
  ollamaModel: '',
  temperature: 0.4,
  topK: 32,
  topP: 1,
};

export const loadAlmSettings = async (): Promise<AlmSettings> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const docRef = doc(db, 'userSettings', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().almSettings || DEFAULT_ALM_SETTINGS;
  } else {
    return DEFAULT_ALM_SETTINGS;
  }
};

export const saveAlmSettings = async (settings: AlmSettings): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const docRef = doc(db, 'userSettings', user.uid);
  await setDoc(docRef, { almSettings: settings }, { merge: true });
};

export const loadApiSettings = async (): Promise<ApiSettings> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const docRef = doc(db, 'userSettings', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const savedSettings = docSnap.data().apiSettings;
    if (savedSettings) {
      const merged = { ...DEFAULT_API_SETTINGS };
      Object.keys(savedSettings).forEach(key => {
        if (savedSettings[key] !== undefined) {
          merged[key] = savedSettings[key];
        }
      });
      return merged;
    } else {
      return DEFAULT_API_SETTINGS;
    }
  } else {
    return DEFAULT_API_SETTINGS;
  }
};

export const saveApiSettings = async (settings: ApiSettings): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const docRef = doc(db, 'userSettings', user.uid);
  await setDoc(docRef, { apiSettings: settings }, { merge: true });
};
