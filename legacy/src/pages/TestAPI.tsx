import { useState } from 'react';

export default function TestAPI() {
  const [out, setOut] = useState('');

  const call = async (fn: string, body = {}) => {
    const r = await fetch(`/.netlify/functions/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setOut(await r.text());
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>API Test Arena</h1>
      <button onClick={() => call('create-daily-room', { roomName: 'arena' })}>
        Daily • create room
      </button>{' '}
      <button onClick={() => call('create-daily-token', { roomName: 'arena' })}>
        Daily • create token
      </button>{' '}
      <button onClick={() => call('delete-daily-room', { roomName: 'arena' })}>
        Daily • delete room
      </button>
      <pre style={{ marginTop: 12, background: '#f4f4f4', padding: 12 }}>
        {out}
      </pre>
    </main>
  );
}
