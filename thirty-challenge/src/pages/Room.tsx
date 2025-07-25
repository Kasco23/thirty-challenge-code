import { useLocation } from 'react-router-dom';

export default function Room() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get('name');
  const flag = query.get('flag');
  const club = query.get('club');

  const logos = import.meta.glob('/src/assets/logos/*.svg', { eager: true });
  const logoSrc = logos[`/src/assets/logos/${club}.svg`] as { default: string };

  return (
    <div className="p-4 space-y-4 text-white">
      <h1 className="text-xl font-bold">Room Session</h1>
      <p>Name: {name}</p>
      <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl">
        <span className={`fi fi-${flag}`}></span>
        {logoSrc?.default && (
          <img
            src={logoSrc.default}
            alt={club || 'club'}
            className="h-10"
          />
        )}
      </div>
    </div>
  );
}