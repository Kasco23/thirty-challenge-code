/**
 * Displays a simple connection status banner. The full game will eventually
 * reflect real-time connectivity to Supabase and Daily.co. For now, this
 * component renders a static message so the UI has some persistent header
 * content during development.
 */
export default function ConnectionBanner() {
  return (
    <div className="w-full bg-gray-800 text-center text-xs text-white py-1">
      Test Environment: Supabase & Daily connections configured via env vars
    </div>
  );
}
