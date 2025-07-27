import { useEffect, useState } from "react";

interface TeamLogoProps {
  club: string;
  className?: string;
  alt?: string;
}

/**
 * Dynamically imports a team logo SVG when the component mounts.
 * This keeps the initial JS bundle small by avoiding eager imports
 * of all team assets. Images are loaded only when needed.
 */
export default function TeamLogo({
  club,
  className,
  alt = club,
}: TeamLogoProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const logos = import.meta.glob<{ default: string }>(
      "../assets/logos/*.svg",
    );
    const loadLogo = logos[`../assets/logos/${club}.svg`];
    if (loadLogo) {
      loadLogo().then((mod) => {
        setSrc(mod.default);
      });
    }
  }, [club]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
