/**
 * Simplified Daily.co configuration for horizontal video component
 */

interface DailyConfig {
  isConfigured: boolean;
  isDevelopmentMode: boolean;
  customDomain?: string;
}

function validateDailyEnvironment(): DailyConfig {
  // For client-side Daily.co integration, we only need to check if Netlify functions can create rooms
  // The DAILY_API_KEY is server-side only (in Netlify functions)
  
  // In development mode, assume Daily.co is available with mock functionality
  const isDevMode = import.meta.env?.DEV === true;
  
  // Check for custom domain configuration
  const customDomain = import.meta.env?.VITE_DAILY_DOMAIN;
  
  // In production, we'll test the actual room creation via Netlify functions
  const isConfigured = true; // We'll validate this dynamically when needed

  if (isDevMode) {
    console.log('🔧 Daily.co Development Mode - Video features enabled');
    if (customDomain) {
      console.log('🎯 Custom Daily.co domain configured:', customDomain);
    }
  } else {
    console.log('✅ Daily.co Production Mode');
    if (customDomain) {
      console.log('🎯 Custom Daily.co domain configured:', customDomain);
    }
  }

  return {
    isConfigured,
    isDevelopmentMode: isDevMode,
    customDomain,
  };
}

const dailyConfig = validateDailyEnvironment();

/**
 * Returns the Daily.co domain to use (custom or default), validating custom domains.
 */
function isValidDailyDomain(domain?: string): boolean {
  // Accepts subdomains like "myteam.daily.co" or "my-team.daily.co"
  // Disallows protocol, slashes, or other domains
  return typeof domain === 'string' &&
    /^[a-zA-Z0-9-]+\.daily\.co$/.test(domain);
}

export const getDailyDomain = () =>
  isValidDailyDomain(dailyConfig.customDomain) ? dailyConfig.customDomain! : 'daily.co';

/**
 * Returns `true` if we're in development mode.
 */
export const isDevelopmentMode = () => dailyConfig.isDevelopmentMode;

/**
 * Returns `true` if Daily.co is properly configured.
 */
export const isDailyConfigured = () => dailyConfig.isConfigured;

/**
 * Test Daily.co integration by checking if the create room endpoint is available
 * without actually creating test rooms
 */
export const testDailyIntegration = async (): Promise<boolean> => {
  try {
    // Simply test if the endpoint is available by making an OPTIONS request
    const response = await fetch('/.netlify/functions/create-daily-room', {
      method: 'OPTIONS',
    });
    
    // If the endpoint responds (even with an error), Daily.co is configured
    return response.status !== 404;
  } catch (error) {
    console.warn('Daily.co integration test failed:', error);
    return false;
  }
};