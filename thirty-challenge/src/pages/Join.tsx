import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "flag-icons/css/flag-icons.min.css";

const flags = ["jo", "iq", "sa", "eg", "ae"];
const clubs = ["real-madrid", "barcelona", "man-city", "al-nassr"];

export default function Join() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("jo");
  const [club, setClub] = useState("real-madrid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    navigate(`/room?name=${name}&lflag=${flag}&club=${club}`);
  };

  return (\
    <div className="min-hscreen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center bg-glass p-8 rounded-xl"
      >
        <input
          type="text"
          placeholder="هبايلة المان