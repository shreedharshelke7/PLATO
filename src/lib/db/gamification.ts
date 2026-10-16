export interface GodRank {
  name: string;
  minXP: number;
  maxXP: number;
  title: string;
  description: string;
}

export const GOD_RANKS: GodRank[] = [
  {
    name: "Mortal",
    minXP: 0,
    maxXP: 149,
    title: "Mortal Seeker",
    description: "Beginning your ascent to Mount Olympus.",
  },
  {
    name: "Hero",
    minXP: 150,
    maxXP: 449,
    title: "Spartan Hero",
    description: "Forging discipline through regular nourishment.",
  },
  {
    name: "Demigod",
    minXP: 450,
    maxXP: 999,
    title: "Ascended Demigod",
    description: "Imbued with godlike vitality and mindful habit.",
  },
  {
    name: "Titan",
    minXP: 1000,
    maxXP: 1999,
    title: "Mighty Titan",
    description: "Commanding nutrition, strength, and unwavering consistency.",
  },
  {
    name: "Olympian",
    minXP: 2000,
    maxXP: Infinity,
    title: "Immortal Olympian",
    description: "Feasting at the table of the gods with perfect mastery.",
  },
];

export function getRankFromXP(xp: number): {
  rank: GodRank;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  const currentXP = Math.max(0, xp);
  const rank =
    GOD_RANKS.find((r) => currentXP >= r.minXP && currentXP <= r.maxXP) ||
    GOD_RANKS[GOD_RANKS.length - 1];

  if (rank.maxXP === Infinity) {
    return {
      rank,
      currentLevelXP: currentXP - rank.minXP,
      nextLevelXP: rank.minXP,
      progressPercent: 100,
    };
  }

  const range = rank.maxXP - rank.minXP + 1;
  const earnedInLevel = currentXP - rank.minXP;
  const progressPercent = Math.min(100, Math.round((earnedInLevel / range) * 100));

  return {
    rank,
    currentLevelXP: earnedInLevel,
    nextLevelXP: range,
    progressPercent,
  };
}

export interface Achievement {
  id: string;
  name: string;
  god: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progressText?: string;
}

export function evaluateAchievements(params: {
  totalScans: number;
  streakDays: number;
  totalWaterLoggedMl: number;
  breakfastStreak: number;
  totalSwapsLogged: number;
}): Achievement[] {
  return [
    {
      id: "first_scan",
      name: "Demeter's First Harvest",
      god: "Demeter",
      description: "Perform your first meal scan or photo recognition.",
      icon: "DemeterIcon",
      isUnlocked: params.totalScans >= 1,
      progressText: `${Math.min(1, params.totalScans)}/1 Scan`,
    },
    {
      id: "7_day_streak",
      name: "Apollo's Eternal Flame",
      god: "Apollo",
      description: "Maintain a 7-day logging streak of mindful fuel.",
      icon: "ApolloIcon",
      isUnlocked: params.streakDays >= 7,
      progressText: `${Math.min(7, params.streakDays)}/7 Days`,
    },
    {
      id: "hydration_hero",
      name: "Poseidon's Torrent",
      god: "Poseidon",
      description: "Log at least 15,000 ml of pure hydration across your journey.",
      icon: "PoseidonIcon",
      isUnlocked: params.totalWaterLoggedMl >= 15000,
      progressText: `${Math.min(15000, params.totalWaterLoggedMl)}/15000 ml`,
    },
    {
      id: "breakfast_champ",
      name: "Hermes' Dawn Fuel",
      god: "Hermes",
      description: "Log breakfast 5 days in a row (defeating the morning rush).",
      icon: "HermesIcon",
      isUnlocked: params.breakfastStreak >= 5,
      progressText: `${Math.min(5, params.breakfastStreak)}/5 Breakfasts`,
    },
    {
      id: "swap_master",
      name: "Dionysus' Alchemy",
      god: "Dionysus",
      description: "Log 3 Divine Swaps that kept flavor while elevating nutrition.",
      icon: "DionysusIcon",
      isUnlocked: params.totalSwapsLogged >= 3,
      progressText: `${Math.min(3, params.totalSwapsLogged)}/3 Swaps`,
    },
  ];
}
