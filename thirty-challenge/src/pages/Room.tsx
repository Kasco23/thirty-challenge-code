import { useLocation } from 'react-router-dom';

export default function Room() {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get('name');
  const flag = query.get('flag');
  const club = query.get('club');

  return (\n    <div className=\"p-4 space-y-4\">\n      <h1 className=\"text-xl font-bold\">Room Session</h1>\n      <p>Name: {name}</p>\n      <div class=\"flex items-center gap-4 bg-gray-200 p-2 rounded\">\n        <span className={`fi fi-{flag}`}></span>\n        <img src={`estanove/logos/${club}.svg`} alt={club} className=\"h-10\" />\n      </div>\n    </div>\n  );
}