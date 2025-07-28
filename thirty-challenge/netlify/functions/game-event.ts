await fetch('/.netlify/functions/game-event', { method:'POST', body: JSON.stringify(row) });
