// Utility to get all available team logos
const logoModules = import.meta.glob('/src/assets/logos/*.svg', { eager: true });

// Extract team names from file paths and create team objects
export const getAllTeams = () => {
  const teams = Object.keys(logoModules).map((path) => {
    const fileName = path.split('/').pop()?.replace('.svg', '') || '';
    const teamName = fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      id: fileName,
      name: teamName,
      logo: (logoModules[path] as any).default,
      searchTerms: [
        teamName.toLowerCase(),
        fileName.toLowerCase().replace(/-/g, ' '),
        fileName.toLowerCase()
      ]
    };
  });

  return teams.sort((a, b) => a.name.localeCompare(b.name));
};

// Search teams by name
export const searchTeams = (teams: ReturnType<typeof getAllTeams>, query: string) => {
  if (!query.trim()) return teams;
  
  const searchQuery = query.toLowerCase();
  return teams.filter(team => 
    team.searchTerms.some(term => term.includes(searchQuery))
  );
};

// Common country flags for the quiz
export const COMMON_FLAGS = [
  { code: 'sa', name: 'السعودية' },
  { code: 'ae', name: 'الإمارات' },
  { code: 'kw', name: 'الكويت' },
  { code: 'qa', name: 'قطر' },
  { code: 'bh', name: 'البحرين' },
  { code: 'om', name: 'عمان' },
  { code: 'jo', name: 'الأردن' },
  { code: 'lb', name: 'لبنان' },
  { code: 'sy', name: 'سوريا' },
  { code: 'iq', name: 'العراق' },
  { code: 'eg', name: 'مصر' },
  { code: 'ma', name: 'المغرب' },
  { code: 'dz', name: 'الجزائر' },
  { code: 'tn', name: 'تونس' },
  { code: 'ly', name: 'ليبيا' },
  { code: 'sd', name: 'السودان' },
  { code: 'ye', name: 'اليمن' },
  { code: 'ps', name: 'فلسطين' },
  { code: 'tr', name: 'تركيا' },
  { code: 'ir', name: 'إيران' },
];

// Search flags by name
export const searchFlags = (query: string) => {
  if (!query.trim()) return COMMON_FLAGS;
  
  const searchQuery = query.toLowerCase();
  return COMMON_FLAGS.filter(flag => 
    flag.name.includes(searchQuery) || flag.code.includes(searchQuery)
  );
};