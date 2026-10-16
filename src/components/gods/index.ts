export { ZeusIcon } from "./ZeusIcon";
export { DemeterIcon } from "./DemeterIcon";
export { PoseidonIcon } from "./PoseidonIcon";
export { HermesIcon } from "./HermesIcon";
export { AthenaIcon } from "./AthenaIcon";
export { ApolloIcon } from "./ApolloIcon";
export { DionysusIcon } from "./DionysusIcon";
export { GreekMeander } from "./GreekMeander";
export { LaurelWreath } from "./LaurelWreath";
export { MarbleColumn } from "./MarbleColumn";

export interface GodMetadata {
  id: string;
  name: string;
  title: string;
  domain: string;
  power: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

export const GODS_MANIFEST = [
  {
    id: "zeus",
    name: "Zeus",
    title: "King of Olympus",
    domain: "Dashboard & Calorie Power Ring",
    power: "Rules your daily caloric threshold with the power of lightning.",
  },
  {
    id: "demeter",
    name: "Demeter",
    title: "Goddess of the Harvest",
    domain: "Food Scanner & Meal Log",
    power: "Transmutes plate photos, barcodes, and Indian meals into exact macros.",
  },
  {
    id: "poseidon",
    name: "Poseidon",
    title: "Lord of the Oceans",
    domain: "Smart Hydration & Waves",
    power: "Maintains optimal cellular hydration with scheduled fluid intervals.",
  },
  {
    id: "hermes",
    name: "Hermes",
    title: "Herald of the Gods",
    domain: "Reminders & Quick-Log",
    power: "Whispers swift reminders and powers one-tap quick meal logging.",
  },
  {
    id: "athena",
    name: "Athena",
    title: "Goddess of Wisdom",
    domain: "AI Coach & 5-Min Plans",
    power: "Crafts balanced daily plans and gives strategic, science-backed guidance.",
  },
  {
    id: "apollo",
    name: "Apollo",
    title: "God of Light & Truth",
    domain: "Goals, Progress & Streaks",
    power: "Illuminates your weight trends, macro splits, and Olympian streaks.",
  },
  {
    id: "dionysus",
    name: "Dionysus",
    title: "Master of Revelry",
    domain: "Divine Swap & Junk Budget",
    power: "Upgrades your guilty cravings into nutritious feasts in under 10 minutes.",
  },
] as const;
