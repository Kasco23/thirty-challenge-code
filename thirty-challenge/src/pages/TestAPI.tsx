import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * TestAPI component provides a simple UI for exercising backend
 * Netlify functions as well as Supabase operations.  It exposes
 * buttons to create Daily.co rooms and meeting tokens, delete
 * rooms, and perform basic CRUD operations against the `games`
 * and `players` tables in Supabase.  All results are rendered
 * using a JSON `<pre>` block for easy inspection.
 */
export default function TestAPI() {
  // store the output from API calls
  const [output, setOutput] = useState<any>(null);
  // optional state for room and user names
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');

  /**
   * Helper to invoke a Netlify function endpoint.
   * All Netlify functions in this project live under
   * `/.netlify/functions/<function-name>`.  The helper wraps
   * common fetch logic, including stringifying the body and
   * parsing the JSON response.  In case of network errors
   * the error message is captured into the output state.
   */
  const callFunction = async (path: string, body: Record<string, any>) => {
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOutput(data);
    } catch (err: any) {
      setOutput({ error: err instanceof Error ? err.message : String(err) });
    }
  };

  // Netlify function wrappers
  const handleCreateRoom = async () => {
    const name = roomName || `test-room-${Date.now()}`;
    await callFunction('/.netlify/functions/create-daily-room', { roomName: name });
  };
  const handleCreateToken = async () => {
    const room = roomName || `test-room-${Date.now()}`;
    const user = userName || 'Test User';
    await callFunction('/.netlify/functions/create-daily-token', {
      room,
      user,
      isHost: false,
    });
  };
  const handleDeleteRoom = async () => {
    if (!roomName) {
      setOutput({ error: 'Please provide a room name before deleting.' });
      return;
    }
    await callFunction('/.netlify/functions/delete-daily-room', { roomName });
  };

  // Supabase CRUD examples
  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*');
    setOutput(error ? { error } : { data });
  };
  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*');
    setOutput(error ? { error } : { data });
  };
  const addPlayer = async () => {
    // Insert a minimal record; adjust fields to your schema if necessary
    const { data, error } = await supabase
      .from('players')
      .insert({ name: `Test Player ${Date.now()}` })
      .select();
    setOutput(error ? { error } : { data });
  };
  const updatePlayer = async () => {
    // Grab the first player row and update its name
    const { data: rows, error: fetchError } = await supabase.from('players').select('*').limit(1);
    if (fetchError || !rows || rows.length === 0) {
      setOutput({ error: fetchError || 'No players to update' });
      return;
    }
    const id = rows[0].id;
    const { data, error } = await supabase
      .from('players')
      .update({ name: `Updated Player ${Date.now()}` })
      .eq('id', id)
      .select();
    setOutput(error ? { error } : { data });
  };
  const deletePlayer = async () => {
    // Delete the first player row as a simple test
    const { data: rows, error: fetchError } = await supabase.from('players').select('*').limit(1);
    if (fetchError || !rows || rows.length === 0) {
      setOutput({ error: fetchError || 'No players to delete' });
      return;
    }
    const id = rows[0].id;
    const { data, error } = await supabase.from('players').delete().eq('id', id).select();
    setOutput(error ? { error } : { data });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold">API Test Utilities</h1>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Room name (optional)"
          className="w-full rounded border p-2"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <input
          type="text"
          placeholder="User name (optional)"
          className="w-full rounded border p-2"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={handleCreateRoom} className="w-full rounded bg-blue-600 p-2 text-white">
          Create Daily Room
        </button>
        <button onClick={handleCreateToken} className="w-full rounded bg-blue-600 p-2 text-white">
          Create Meeting Token
        </button>
        <button onClick={handleDeleteRoom} className="w-full rounded bg-red-600 p-2 text-white">
          Delete Daily Room
        </button>
        <hr />
        <button onClick={fetchGames} className="w-full rounded bg-green-600 p-2 text-white">
          Fetch Games
        </button>
        <button onClick={fetchPlayers} className="w-full rounded bg-green-600 p-2 text-white">
          Fetch Players
        </button>
        <button onClick={addPlayer} className="w-full rounded bg-green-600 p-2 text-white">
          Add Player
        </button>
        <button onClick={updatePlayer} className="w-full rounded bg-yellow-600 p-2 text-white">
          Update Player
        </button>
        <button onClick={deletePlayer} className="w-full rounded bg-red-600 p-2 text-white">
          Delete Player
        </button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-white">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}