import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

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
