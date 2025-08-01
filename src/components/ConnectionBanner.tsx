import { isSupabaseConfigured, getConfigurationError } from '@/lib/supabaseClient';
import { isDailyConfigured, getDailyConfigurationError } from '@/lib/dailyConfig';

/**
 * Enhanced connection status banner with comprehensive environment validation
 */
export default function ConnectionBanner() {
  const supabaseConnected = isSupabaseConfigured();
  const dailyConnected = isDailyConfigured();
  
  const supabaseError = getConfigurationError();
  const dailyError = getDailyConfigurationError();
  
  // All services connected - production ready
  if (supabaseConnected && dailyConnected) {
    return (
      <div className="w-full bg-green-800 text-center text-xs text-white py-1">
        ✅ Production Environment: Supabase & Daily.co connected
      </div>
    );
  }
  
  // No services connected - offline mode
  if (!supabaseConnected && !dailyConnected) {
    return (
      <div className="w-full bg-red-800 text-center text-xs text-white py-1">
        ⚠️ Offline Mode: Missing Supabase & Daily.co configuration
        {(supabaseError || dailyError) && (
          <div className="text-red-200 text-xs mt-1">
            {[supabaseError, dailyError].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>
    );
  }
  
  // Partial configuration - development mode
  const services = [
    supabaseConnected ? 'Supabase ✅' : 'Supabase ❌',
    dailyConnected ? 'Daily.co ✅' : 'Daily.co ❌'
  ].join(' • ');
  
  const errors = [supabaseError, dailyError].filter(Boolean);
  
  return (
    <div className="w-full bg-yellow-800 text-center text-xs text-white py-1">
      ⚠️ Partial Configuration: {services}
      {errors.length > 0 && (
        <div className="text-yellow-200 text-xs mt-1">
          {errors.join(' • ')}
        </div>
      )}
    </div>
  );
}
