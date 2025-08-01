/**
 * Enhanced Daily.co environment validation and configuration
 */

interface DailyConfig {
  apiKey: string | null;
  domain: string | null;
  isConfigured: boolean;
  missingVars: string[];
}

function validateDailyEnvironment(): DailyConfig {
  // Check both server-side and client-side environment variables
  const apiKey = typeof process !== 'undefined' 
    ? process.env?.DAILY_API_KEY 
    : import.meta.env?.VITE_DAILY_API_KEY;
    
  const domain = import.meta.env?.VITE_DAILY_DOMAIN || import.meta.env?.DAILY_DOMAIN;

  const missingVars: string[] = [];
  
  if (!apiKey) missingVars.push('DAILY_API_KEY');
  if (!domain) missingVars.push('VITE_DAILY_DOMAIN');

  const isConfigured = missingVars.length === 0 && 
    apiKey !== 'example-daily-key' &&
    domain !== 'example.daily.co';

  if (missingVars.length > 0) {
    console.warn(
      '🔧 Daily.co Configuration Missing:',
      missingVars.join(', '),
      '- Video features will not work'
    );
  } else if (!isConfigured) {
    console.warn(
      '🔧 Daily.co Configuration Invalid:',
      'Using placeholder values - Video features will not work'
    );
  } else {
    console.log('✅ Daily.co Configuration Valid');
  }

  return {
    apiKey,
    domain,
    isConfigured,
    missingVars,
  };
}

const dailyConfig = validateDailyEnvironment();

/**
 * Returns detailed Daily.co configuration status.
 */
export const getDailyConfig = () => dailyConfig;

/**
 * Returns `true` if Daily.co is properly configured.
 */
export const isDailyConfigured = () => dailyConfig.isConfigured;

/**
 * Returns a user-friendly error message for Daily.co configuration issues.
 */
export const getDailyConfigurationError = (): string | null => {
  if (dailyConfig.isConfigured) return null;
  
  if (dailyConfig.missingVars.length > 0) {
    return `متغيرات Daily.co مفقودة: ${dailyConfig.missingVars.join(', ')}`;
  }
  
  return 'إعدادات Daily.co غير صحيحة - ميزات الفيديو معطلة';
};

/**
 * Validates if Daily.co operations can be performed.
 */
export const canUseDailyFeatures = (): boolean => {
  return dailyConfig.isConfigured;
};

/**
 * Gets the Daily.co domain for room URLs.
 */
export const getDailyDomain = (): string | null => {
  return dailyConfig.domain;
};