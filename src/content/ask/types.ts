export type AskLink = {
  label: string;
  href: string;
  kind: "repo" | "demo" | "credential" | "profile";
};

export type AskProject = {
  id: string;
  name: string;
  tagline: string;
  period: string;
  context: "work" | "research" | "academic" | "hackathon" | "personal";
  role: string;
  stack: string[];
  highlights: string[];
  links: AskLink[];
  caveats?: string[];
  keywords: string[];
  featured?: boolean;
};

export type AskExperience = {
  id: string;
  organization: string;
  role: string;
  kind: "work" | "research" | "teaching" | "leadership" | "freelance";
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
  caveats?: string[];
  keywords: string[];
};

export type AskSkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export type AskEducation = {
  id: string;
  institution: string;
  credential: string;
  period: string;
  location: string;
  details: string[];
  keywords: string[];
};

export type AskCertification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  verificationUrl: string;
  keywords: string[];
};

export type AskHonor = {
  id: string;
  title: string;
  event?: string;
  date?: string;
  placement?: string;
  teamSize?: number;
  role?: string;
  summary: string;
  links?: AskLink[];
  keywords: string[];
};

export type AskLeadership = {
  id: string;
  organization: string;
  role: string;
  period: string;
  summary: string;
  keywords: string[];
};

export type AskFaq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export type AskBoundary = {
  id: string;
  rule: string;
};

export type AskProfile = {
  name: string;
  preferredName: string;
  headline: string;
  location: string;
  email: string;
  lastReviewed: string;
  links: AskLink[];
  interests: string[];
  currentRoles: string[];
  availability: {
    status: "not-published";
    note: string;
  };
  narrative: {
    status: "pending" | "ready";
    shortBio: string;
    originStory: string;
    note: string;
  };
};
