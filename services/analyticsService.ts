import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

// Helper function to log custom events safely
export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};
