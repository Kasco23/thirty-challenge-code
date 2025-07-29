import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Join page allowing a user to enter their name and a room ID.  In the
 * simplified Test_arena branch joining a room does not start any game
 * logic; instead it simply navigates the user to `/test-api` where
 * the netlify functions can be exercised.
 */
export default function Join() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demonstration simply navigate to the test page; in a full
    // implementation you would call an API to join the room.
    navigate('/test-api');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Join a Game</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full rounded border p-2"
        />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room ID"
          className="w-full rounded border p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Join Room
        </button>
      </form>
    </div>
  );
}
