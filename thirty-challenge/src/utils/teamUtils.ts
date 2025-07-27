// Functions to import team logo SVGs on demand
const logoModules = import.meta.glob<{ default: string }>(
  "../assets/logos/*.svg",
);

export interface Team {
  name: string;
  displayName: string;
  searchTerms: string[];
}

export function getAllTeams(): Team[] {
  const teams: Team[] = [];

  for (const path in logoModules) {
    const fileName = path.split("/").pop()?.replace(".svg", "") || "";
    const displayName = fileName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    teams.push({
      name: fileName,
      displayName,
      searchTerms: [
        fileName,
        displayName.toLowerCase(),
        ...fileName.split("-"),
      ],
    });
  }

  return teams.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Lazily load a logo and return its resolved path.
 * Useful for components that display a club badge without bundling
 * all SVGs in the initial chunk.
 */
export async function loadLogoPath(club: string): Promise<string> {
  const loader = logoModules[`../assets/logos/${club}.svg`];
  if (loader) {
    const mod = await loader();
    return mod.default;
  }
  return "";
}

export function searchTeams(teams: Team[], query: string): Team[] {
  if (!query.trim()) return teams;

  const searchTerm = query.toLowerCase();
  return teams.filter((team) =>
    team.searchTerms.some((term) => term.includes(searchTerm)),
  );
}

// Common Arab country flags for the join page
export const COMMON_FLAGS = [
  { code: "sa", name: "السعودية" },
  { code: "ae", name: "الإمارات" },
  { code: "eg", name: "مصر" },
  { code: "jo", name: "الأردن" },
  { code: "lb", name: "لبنان" },
  { code: "sy", name: "سوريا" },
  { code: "iq", name: "العراق" },
  { code: "kw", name: "الكويت" },
  { code: "qa", name: "قطر" },
  { code: "bh", name: "البحرين" },
  { code: "om", name: "عمان" },
  { code: "ye", name: "اليمن" },
  { code: "ps", name: "فلسطين" },
  { code: "ma", name: "المغرب" },
  { code: "tn", name: "تونس" },
  { code: "dz", name: "الجزائر" },
  { code: "ly", name: "ليبيا" },
  { code: "sd", name: "السودان" },
  { code: "so", name: "الصومال" },
  { code: "dj", name: "جيبوتي" },
  { code: "km", name: "جزر القمر" },
  { code: "mr", name: "موريتانيا" },
];

export function searchFlags(query: string) {
  if (!query.trim()) return COMMON_FLAGS;

  const searchTerm = query.toLowerCase();
  return COMMON_FLAGS.filter(
    (flag) => flag.name.includes(searchTerm) || flag.code.includes(searchTerm),
  );
}
