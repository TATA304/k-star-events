export type RsvpStatus = "Open" | "Closed" | "Full";

export type City =
  | "Kuala Lumpur"
  | "Selangor"
  | "Penang"
  | "Johor"
  | "Ipoh"
  | "Melaka";

export const ALL_CITIES: City[] = [
  "Kuala Lumpur",
  "Selangor",
  "Penang",
  "Johor",
  "Ipoh",
  "Melaka",
];

export const ALL_GROUPS = [
  "SEVENTEEN",
  "ENHYPEN",
  "TXT",
  "TWICE",
  "aespa",
  "NCT WISH",
  "TWS",
  "ZEROBASEONE",
  "BTS",
  "BLACKPINK",
  "IVE",
  "LE SSERAFIM",
  "NewJeans",
  "RIIZE",
  "BOYNEXTDOOR",
  "Stray Kids",
  "ITZY",
  "NCT DREAM",
  "NCT 127",
] as const;

export type OfficialGroup = (typeof ALL_GROUPS)[number];

// Aliases used only as search keywords. The saved value is always the official name.
export const GROUP_ALIASES: Record<string, OfficialGroup> = {
  SVT: "SEVENTEEN",
  ZB1: "ZEROBASEONE",
  TXT: "TXT",
  TBZ: "TXT",
  LSF: "LE SSERAFIM",
  LESSERAFIM: "LE SSERAFIM",
  NJ: "NewJeans",
  NEWJEANS: "NewJeans",
  SKZ: "Stray Kids",
  STRAYKIDS: "Stray Kids",
  BNK: "BOYNEXTDOOR",
  BND: "BOYNEXTDOOR",
};

export function isOfficialGroup(v: string): v is OfficialGroup {
  return (ALL_GROUPS as readonly string[]).includes(v);
}

export const RSVP_OPTIONS: RsvpStatus[] = ["Open", "Closed", "Full"];

export interface FanEvent {
  id: string;
  title: string;
  group: string;
  member: string;
  date: string; // ISO YYYY-MM-DD
  dateLabel: string;
  dateShort: string; // DD/MM/YY
  time: string;
  startTime?: string;
  endTime?: string;
  cafe: string;
  location: string;
  address: string;
  city: City;
  rsvp: RsvpStatus;
  freebies: string[];
  organizer: string;
  organizerId?: string;
  description?: string;
  googleMapsLink?: string;
  images?: string[]; // data URLs
  poster?: string; // gradient fallback
}

export function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
export function formatDateShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// Sample events without real poster images have been removed.
// The Event Listing only shows organizer-created events (which include uploaded images).
export const SEED_EVENTS: FanEvent[] = [];

