import React from 'react';

/**
 * Simple connection status banner for the Test_arena branch.  In the
 * original application this component reflected real‑time connectivity
 * to both Supabase and Daily.co.  Here it renders a static message
 * indicating that the app is running in test mode.
 */
export default function ConnectionBanner() {
  return (
    <div className="w-full bg-gray-800 text-center text-xs text-white py-1">
      Test Environment: Supabase & Daily connections configured via env vars
    </div>
  );
}