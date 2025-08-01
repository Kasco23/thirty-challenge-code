import { atom } from 'jotai';

export interface FakeParticipant {
  id: string;
  name: string;
  type: 'host' | 'playerA' | 'playerB';
  isConnected: boolean;
  aspectRatio: number;
  avatarColor: string;
}

// Individual fake participant atoms
export const fakeHostAtom = atom<FakeParticipant | null>(null);
export const fakePlayerAAtom = atom<FakeParticipant | null>(null);
export const fakePlayerBAtom = atom<FakeParticipant | null>(null);

// Helper function to generate default fake participant
export const createFakeParticipant = (type: 'host' | 'playerA' | 'playerB', aspectRatio: number = 16/9): FakeParticipant => {
  const names = {
    host: 'مقدم وهمي',
    playerA: 'لاعب وهمي 1',
    playerB: 'لاعب وهمي 2'
  };
  
  const colors = {
    host: '#3B82F6',
    playerA: '#10B981', 
    playerB: '#8B5CF6'
  };

  return {
    id: `fake-${type}-${Date.now()}`,
    name: names[type],
    type,
    isConnected: true,
    aspectRatio,
    avatarColor: colors[type]
  };
};

// Action atoms
export const addFakeHostAtom = atom(
  null,
  (_get, set, aspectRatio: number = 16/9) => {
    const newFakeHost = createFakeParticipant('host', aspectRatio);
    set(fakeHostAtom, newFakeHost);
    console.log('Added fake host:', newFakeHost);
  }
);

export const addFakePlayerAAtom = atom(
  null,
  (_get, set, aspectRatio: number = 16/9) => {
    const newFakePlayerA = createFakeParticipant('playerA', aspectRatio);
    set(fakePlayerAAtom, newFakePlayerA);
    console.log('Added fake playerA:', newFakePlayerA);
  }
);

export const addFakePlayerBAtom = atom(
  null,
  (_get, set, aspectRatio: number = 16/9) => {
    const newFakePlayerB = createFakeParticipant('playerB', aspectRatio);
    set(fakePlayerBAtom, newFakePlayerB);
    console.log('Added fake playerB:', newFakePlayerB);
  }
);

// Update name atoms
export const updateFakeHostNameAtom = atom(
  null,
  (get, set, newName: string) => {
    const current = get(fakeHostAtom);
    if (current) {
      set(fakeHostAtom, { ...current, name: newName });
    }
  }
);

export const updateFakePlayerANameAtom = atom(
  null,
  (get, set, newName: string) => {
    const current = get(fakePlayerAAtom);
    if (current) {
      set(fakePlayerAAtom, { ...current, name: newName });
    }
  }
);

export const updateFakePlayerBNameAtom = atom(
  null,
  (get, set, newName: string) => {
    const current = get(fakePlayerBAtom);
    if (current) {
      set(fakePlayerBAtom, { ...current, name: newName });
    }
  }
);

// Toggle connection status atoms
export const toggleFakeHostConnectionAtom = atom(
  null,
  (get, set) => {
    const current = get(fakeHostAtom);
    if (current) {
      set(fakeHostAtom, { ...current, isConnected: !current.isConnected });
    }
  }
);

export const toggleFakePlayerAConnectionAtom = atom(
  null,
  (get, set) => {
    const current = get(fakePlayerAAtom);
    if (current) {
      set(fakePlayerAAtom, { ...current, isConnected: !current.isConnected });
    }
  }
);

export const toggleFakePlayerBConnectionAtom = atom(
  null,
  (get, set) => {
    const current = get(fakePlayerBAtom);
    if (current) {
      set(fakePlayerBAtom, { ...current, isConnected: !current.isConnected });
    }
  }
);

// Remove fake participant atoms
export const removeFakeHostAtom = atom(
  null,
  (_get, set) => {
    set(fakeHostAtom, null);
    console.log('Removed fake host');
  }
);

export const removeFakePlayerAAtom = atom(
  null,
  (_get, set) => {
    set(fakePlayerAAtom, null);
    console.log('Removed fake playerA');
  }
);

export const removeFakePlayerBAtom = atom(
  null,
  (_get, set) => {
    set(fakePlayerBAtom, null);
    console.log('Removed fake playerB');
  }
);