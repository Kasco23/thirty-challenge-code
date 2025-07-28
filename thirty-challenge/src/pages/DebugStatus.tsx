import ConnectionBanner from '../components/ConnectionBanner';
import { useErrorLog } from '../hooks/useErrorLog';

/**
 * Displays live connection status and recent error logs for quick debugging.
 */
export default function DebugStatus() {
  const logs = useErrorLog();
  const [requests, setRequests] = React.useState<string[]>([]);
  // tap into window.fetch once
  React.useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (...args) => {
      const [input] = args;
      const res = await orig(...args);
      setRequests((prev) =>
        [...prev, `${res.status} ${typeof input === "string" ? input : input.url}`].slice(-20),
      );
      return res;
    };
    return () => {
      window.fetch = orig;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <ConnectionBanner />
      <h1 className="text-2xl font-bold mb-4">Debug Status</h1>
      <pre className="bg-black/40 p-4 rounded-lg h-64 overflow-auto text-sm whitespace-pre-wrap">
        {logs.join('\n') || 'No errors yet'}
      </pre>
      <h2 className="mt-6 font-semibold">Last 20 HTTP calls</h2>
      <pre className="bg-black/40 p-4 rounded-lg h-48 overflow-auto text-xs whitespace-pre-wrap">
        {requests.join("\n") || "No requests yet"}  
      </pre>
    </div>
  );
}
