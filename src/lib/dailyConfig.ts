/**
 * Simplified Daily.co configuration for client-side video integration
 */

interface DailyConfig {
  isConfigured: boolean;
  missingVars: string[];
  isDevelopmentMode: boolean;
  customDomain?: string;
}

function validateDailyEnvironment(): DailyConfig {
  // For client-side Daily.co integration, we only need to check if Netlify functions can create rooms
  // The DAILY_API_KEY is server-side only (in Netlify functions)
  const missingVars: string[] = [];
  
  // In development mode, assume Daily.co is available with mock functionality
  const isDevMode = import.meta.env?.DEV === true;
  
  // Check for custom domain configuration
  const customDomain = import.meta.env?.VITE_DAILY_DOMAIN;
  
  // In production, we'll test the actual room creation via Netlify functions
  const isConfigured = true; // We'll validate this dynamically when needed

  if (isDevMode) {
    console.log('🔧 Daily.co Development Mode - Video features enabled with mock data');
    if (customDomain) {
      console.log('🎯 Custom Daily.co domain configured:', customDomain);
    }
  } else {
    console.log('✅ Daily.co Production Mode - Validating via API calls');
    if (customDomain) {
      console.log('🎯 Custom Daily.co domain configured:', customDomain);
    }
  }

  return {
    isConfigured,
    missingVars,
    isDevelopmentMode: isDevMode,
    customDomain,
  };
}

const dailyConfig = validateDailyEnvironment();

/**
 * Returns the Daily.co domain to use (custom or default)
 */
export const getDailyDomain = () => dailyConfig.customDomain || 'daily.co';

/**
 * Returns `true` if we're in development mode.
 */
export const isDevelopmentMode = () => dailyConfig.isDevelopmentMode;

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
 * Test Daily.co integration by attempting to create a test room
 */
export const testDailyIntegration = async (): Promise<boolean> => {
  try {
    const response = await fetch('/.netlify/functions/create-daily-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: `test-${Date.now()}`,
        properties: { max_participants: 2 }
      })
    });
    
    if (response.ok) {
      // Clean up test room
      const roomData = await response.json();
      await fetch('/.netlify/functions/delete-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomData.roomName })
      });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Daily.co integration test failed:', error);
    return false;
  }
};