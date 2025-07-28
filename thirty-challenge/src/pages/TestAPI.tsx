import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
  // API responses are arbitrary JSON, so store as unknown
  const [output, setOutput] = useState<unknown>(null);
  // optional state for room and user names
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [meetingToken, setMeetingToken] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false); // log of all operations performed in this page
  const [log, setLog] = useState<string[]>([]);

  /** Convenience utility to add a timestamped message to the log state. */
  const addLog = (msg: string, data?: unknown) =>
    setLog((l) => [
      ...l,
      `${new Date().toISOString()}  ${msg}${data ? "  " + JSON.stringify(data) : ""}`,
    ]);

  /**
   * Generic helper for invoking Netlify serverless functions.
   * Each call posts a JSON payload and returns the parsed JSON
   * response. Any error is surfaced through a thrown exception
   * which callers can catch and log.
   */
  const callFn = async (name: string, payload: unknown) => {
    const res = await fetch(`/.netlify/functions/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Fetch only resolves network errors. non-2xx statuses
    // still produce a Response object, so we parse and return it.
    return res.json();
  };

  // Netlify function wrappers
  const handleCreateRoom = async () => {
    const name = roomName || `room-${Date.now()}`;
    addLog(`Create Room: ${name}`);
    try {
      const data = await callFn("create-daily-room", { roomName: name });
      setOutput(data);
      setRoomUrl(data.url);
      addLog("Create Room → " + JSON.stringify(data));
    } catch (err) {
      setOutput({ error: String(err) });
      setMeetingToken(data.token);
      addLog("Create Room Error", err);
    }
  };

  const handleCreateToken = async () => {
    const room = roomName || `room-${Date.now()}`;
    const user = userName || "Test User";
    addLog(`Create Token for ${room}`);
    try {
      const data = await callFn("create-daily-token", {
        room,
        user,
        isHost: true,
      });
      setOutput(data);
      addLog("Create Token → " + JSON.stringify(data));
    } catch (err) {
      setOutput({ error: String(err) });
      addLog("Create Token Error", err);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomName) {
      setOutput({ error: "Please provide a room name before deleting." });
      return;
    }
    addLog(`Delete Room: ${roomName}`);
    try {
      const data = await callFn("delete-daily-room", { roomName });
      setOutput(data);
      addLog("Delete Room → " + JSON.stringify(data));
    } catch (err) {
      setOutput({ error: String(err) });
      addLog("Delete Room Error", err);
    }
  };

  // Supabase CRUD examples
  const fetchGames = async () => {
    const { data, error } = await supabase.from("games").select("*");
    setOutput(error ? { error } : { data });
  };
  const fetchPlayers = async () => {
    const { data, error } = await supabase.from("players").select("*");
    setOutput(error ? { error } : { data });
  };
  const addPlayer = async () => {
    // Insert a minimal record; adjust fields to your schema if necessary
    const { data, error } = await supabase
      .from("players")
      .insert({ name: `Test Player ${Date.now()}` })
      .select();
    setOutput(error ? { error } : { data });
  };
  const updatePlayer = async () => {
    // Grab the first player row and update its name
    const { data: rows, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .limit(1);
    if (fetchError || !rows || rows.length === 0) {
      setOutput({ error: fetchError || "No players to update" });
      return;
    }
    const id = rows[0].id;
    const { data, error } = await supabase
      .from("players")
      .update({ name: `Updated Player ${Date.now()}` })
      .eq("id", id)
      .select();
    setOutput(error ? { error } : { data });
  };
  const deletePlayer = async () => {
    // Delete the first player row as a simple test
    const { data: rows, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .limit(1);
    if (fetchError || !rows || rows.length === 0) {
      setOutput({ error: fetchError || "No players to delete" });
      return;
    }
    const id = rows[0].id;
    const { data, error } = await supabase
      .from("players")
      .delete()
      .eq("id", id)
      .select();
    setOutput(error ? { error } : { data });
  };

  /** Join the created Daily room in an embedded iframe */
  const handleJoinRoom = () => {
    if (!roomUrl || !meetingToken) {
      setOutput({ error: "Create room & token first." });
      return;
    }
    addLog("Join Room");
    setShowVideo(true);
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
        <button
          onClick={handleCreateRoom}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Create Daily Room
        </button>
        <button
          onClick={handleCreateToken}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Create Meeting Token
        </button>
        <button
          onClick={handleJoinRoom}
          className="w-full rounded bg-indigo-600 p-2 text-white"
        >
          Join Video Call
        </button>
        <button
          onClick={handleDeleteRoom}
          className="w-full rounded bg-red-600 p-2 text-white"
        >
          Delete Daily Room
        </button>
        <hr />
        <button
          onClick={fetchGames}
          className="w-full rounded bg-green-600 p-2 text-white"
        >
          Fetch Games
        </button>
        <button
          onClick={fetchPlayers}
          className="w-full rounded bg-green-600 p-2 text-white"
        >
          Fetch Players
        </button>
        <button
          onClick={addPlayer}
          className="w-full rounded bg-green-600 p-2 text-white"
        >
          Add Player
        </button>
        <button
          onClick={updatePlayer}
          className="w-full rounded bg-yellow-600 p-2 text-white"
        >
          Update Player
        </button>
        <button
          onClick={deletePlayer}
          className="w-full rounded bg-red-600 p-2 text-white"
        >
          Delete Player
        </button>
      </div>
      {/* ─── Embedded Daily iframe ───────────────────────── */}
      {showVideo && roomUrl && meetingToken && (
        <iframe
          title="Daily Video"
          src={`${roomUrl}?t=${meetingToken}&embed=true`}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          style={{
            width: "100%",
            maxWidth: "100%",
            height: "600px",
            border: 0,
          }}
        />
      )}
      <pre className="mt-4 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-white">
        {JSON.stringify(output, null, 2)}
      </pre>
      <details className="mt-4 w-full">
        <summary className="cursor-pointer font-bold">📜 Event Log</summary>
        <pre className="mt-2 max-h-64 overflow-y-auto text-xs">
          {log.join("\n")}
        </pre>
      </details>
    </div>
  );
}
