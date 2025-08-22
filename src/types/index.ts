export type GoalsKey = "Money" | "Mastery" | "Health" | "Impact" | "Autonomy" | "Optionality";

export type ProjectProfile = {
  name?: string;
  age?: number;
  city?: string;
  experience_years?: number;
  domains?: string[];
  goals_ranked: GoalsKey[];
  constraints?: string[];
  risk_appetite?: "Low" | "Balanced" | "High";
  prefs?: { travel: number; wfh: number };
};

export type ProjectInput = {
  id: string;
  profile: ProjectProfile;
  decisions: string[];
  horizon_years: 3 | 5;
  sliders: { risk: number; black_swan: number; travel: number; wfh: number };
  ui_prefs: { num_timelines: 3 | 5; mode: "Quick" | "Deep" };
};

export type TimelineYear = {
  y: number;
  milestones: string[];
  incomeL?: number;
  saveL?: number;
  eqL?: number;
  skills?: string[];
  sleep?: number;
  travel?: number;
  impactP?: number;
  flags?: string[];
};

export type Timeline = {
  id: string;
  label: string;
  rationale?: string;
  scores: { money: number; mastery: number; health: number; impact: number; autonomy: number; optionality: number };
  years: TimelineYear[];
};

export type Tradeoffs = {
  pareto: { timeline_id: string; dominant: GoalsKey[]; weak: GoalsKey[] }[];
  regret_min: string;
  recommendation: { chosen_timeline_id: string; why: string };
};

export type Plan = {
  okr: { o: string; kr: string[] }[];
  weeks: { w: number; tasks: string[]; hab: string[] }[];
  blocks: { t: string; dur: number; days: string[]; time: string }[];
  resources?: { title: string; type: "doc" | "link"; url?: string }[];
};

export type TrailerScene = { 
  t: number; 
  title: string; 
  subtitle?: string; 
  caption?: string; 
};

export type ProjectResult = {
  project_id: string;
  timelines?: Timeline[];
  tradeoffs?: Tradeoffs;
  plan?: Plan;
  trailer?: TrailerScene[];
  saved_at?: string;
};