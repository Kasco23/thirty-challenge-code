import { useState, useEffect } from 'react';
import ConnectionBanner from '../components/ConnectionBanner';
import { useErrorLog } from '../hooks/useErrorLog';

export default function DebugStatus() {
  const logs = useErrorLog();
  const [requests, setRequests] = useState<string[]>([]);

  // Intercept all fetch calls to log URL and status
  useEffect(() => {
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const [input] = args;
      const res = await origFetch(...args);
      // Normalize URL from RequestInfo (string | Request | URL)
      const urlString =
        typeof input === 'string'
          ? input
          : input instanceof Request
          ? input.url
          : String(input);
      setRequests(prev =>
        [...prev, `${res.status} ${urlString}`].slice(-20)
      );
      return res;
    };
    return () => {
      window.fetch = origFetch;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Live connection & auth status */}
      <ConnectionBanner />

      {/* Error log */}
      <h1 className="text-2xl font-bold mb-4">Debug Status</h1>
      <pre className="bg-black/40 p-4 rounded-lg h-64 overflow-auto text-sm whitespace-pre-wrap">
        {logs.length > 0 ? logs.join('\n') : 'No errors yet'}
      </pre>

      {/* HTTP calls log */}
      <h2 className="mt-6 text-xl font-semibold">Last 20 HTTP calls</h2>
      <pre className="bg-black/40 p-4 rounded-lg h-48 overflow-auto text-xs whitespace-pre-wrap">
        {requests.length > 0 ? requests.join('\n') : 'No requests yet'}
      </pre>
    </div>
  );
}
