import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Displays a temporary banner showing connection status to Supabase and Daily.co.
 * Supabase is checked via a simple SELECT query while Daily.co is probed by
 * hitting the Netlify function. This component should be removed after testing.
 */
export default function ConnectionBanner() {
  const [supabaseOk, setSupabaseOk] = useState<'checking' | 'ok' | 'fail'>(
    'checking',
  );
  const [dailyOk, setDailyOk] = useState<'checking' | 'ok' | 'fail'>(
    'checking',
  );

  useEffect(() => {
    const checkSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setSupabaseOk('fail');
        return;
      }
      try {
        const { error } = await supabase.from('games').select('id').limit(1);
        setSupabaseOk(error ? 'fail' : 'ok');
      } catch {
        setSupabaseOk('fail');
      }
    };

    const checkDaily = async () => {
      try {
        const res = await fetch('/.netlify/functions/create-daily-room');
        setDailyOk(res.ok || res.status === 405 ? 'ok' : 'fail');
      } catch {
        setDailyOk('fail');
      }
    };

    checkSupabase();
    checkDaily();
  }, []);

  return (
    <div className="bg-gray-900 text-white text-center text-sm py-1">
      <span className={supabaseOk === 'ok' ? 'text-green-400' : 'text-red-400'}>
        Supabase: {supabaseOk === 'ok' ? 'Connected' : 'Error'}
      </span>
      <span className="mx-2">|</span>
      <span className={dailyOk === 'ok' ? 'text-green-400' : 'text-red-400'}>
        Daily.co: {dailyOk === 'ok' ? 'Connected' : 'Error'}
      </span>
    </div>
  );
}
