import type { AskProfile } from "./types";

export const askProfile: AskProfile = {
  name: "Muhammad Ibtasaam Amjad",
  preferredName: "Ibtasaam",
  headline:
    "Computer science student at FAST-NUCES, CTO at Verteon, and builder of agentic AI systems.",
  location: "Rawalpindi, Pakistan",
  email: "ibtasaam.mughal@gmail.com",
  lastReviewed: "2026-10-27",
  links: [
    { label: "Portfolio", href: "https://ibtasaam.com", kind: "profile" },
    { label: "GitHub", href: "https://github.com/Mughal-Hash-24", kind: "profile" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/muhammad-ibtisaam-amjad",
      kind: "profile",
    },
    {
      label: "CV",
      href: "https://ibtasaam.com/cv/muhammad-ibtisaam-amjad-cv.pdf",
      kind: "profile",
    },
  ],
  interests: [
    "NLP",
    "Agentic AI",
    "Mathematics",
    "Computer Science",
    "Philosophy",
    "Literature",
    "Poetry",
    "History",
    "Cricket",
    "Chess",
  ],
  currentRoles: [
    "Chief Technology Officer at Verteon",
    "Intern at the Parallel Computing Networks Lab",
    "Teaching Assistant at FAST-NUCES",
  ],
  availability: {
    status: "not-published",
    note: "Availability, internship windows, and role fit are not published. Ask Ibtasaam directly by email or LinkedIn.",
  },
  narrative: {
    status: "pending",
    shortBio:
      "Ibtasaam is a computer science student at FAST-NUCES Islamabad and the CTO of Verteon, a startup building an offline posture-correction system. He works across agentic AI, NLP, backend systems, and interface design.",
    originStory: "",
    note: "Ibtasaam is writing the long-form narrative. The public narrative spine is that gaming led him into computer science.",
  },
};
