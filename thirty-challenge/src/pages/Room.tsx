import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Room() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name");
  const flag = query.get("flag");
  const club = query.get("club");

  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    const logos = import.meta.glob<{ default: string }>(
      "/src/assets/logos/*.svg",
    );
    const loadLogo = logos[`/src/assets/logos/${club}.svg`];
    if (loadLogo) {
      loadLogo().then((mod) => {
        setLogoSrc(mod.default);
      });
    }
  }, [club]);

  return (
    <div className="p-4 space-y-4 text-white">
      <h1 className="text-xl font-bold">Room Session</h1>
      <p>Name: {name}</p>
      <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl">
        <span className={`fi fi-${flag}`}></span>
        {logoSrc && <img src={logoSrc} alt={club || "club"} className="h-10" />}
      </div>
    </div>
  );
}
