import ConnectionBanner from '../components/ConnectionBanner';
import { useErrorLog } from '../hooks/useErrorLog';

/**
 * Displays live connection status and recent error logs for quick debugging.
 */
export default function DebugStatus() {
  const logs = useErrorLog();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <ConnectionBanner />
      <h1 className="text-2xl font-bold mb-4">Debug Status</h1>
      <pre className="bg-black/40 p-4 rounded-lg h-64 overflow-auto text-sm whitespace-pre-wrap">
        {logs.join('\n') || 'No errors yet'}
      </pre>
    </div>
  );
}
