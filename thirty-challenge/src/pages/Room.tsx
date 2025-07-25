import { useLocation } from 'react-router-dom';

export default function Room() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get('name');
  const flag = query.get('flag');
  const club = query.get('club');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Room Session</h1>
      <p>Name: {name}</p>
      <div className="flex items-center gap-4 bg-gray-200 p-2 rounded">
        <span className={`fi fi-${flag}`}></span>
        <img
          src={`/src/assets/logos/${club}.svg`}
          alt={club || 'club'}
          className="h-10"
        />
      </div>
    </div>
  );
}