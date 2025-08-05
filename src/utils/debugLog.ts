export const debugLog = (component: string, action: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.group(`🐛 ${component} - ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.trace('Call stack');
    console.groupEnd();
  }
};