import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics only if measurementId is present (production)
let analytics: Analytics | null = null;
if (firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

export { analytics };
