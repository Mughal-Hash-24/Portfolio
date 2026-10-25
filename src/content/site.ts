export const site = {
  name: "Ibtasaam Amjad",
  shortName: "Ibtasaam",
  role: "Developer · Storyteller · Creative Innovator",
  description:
    "Portfolio of Ibtasaam Amjad — developer, storyteller, and creative innovator. Selected work, playable games, and an AI guide that answers questions about him.",
  url: "https://ibtasaam.com",
  email: "ibtasaam.mughal@gmail.com",
  location: "Rawalpindi, Pakistan",
  github: "https://github.com/Mughal-Hash-24",
  linkedin: "https://www.linkedin.com/in/muhammad-ibtasaam-amjad",
  cv: "/cv/muhammad-ibtasaam-amjad-cv.pdf",
} as const;

const projectsChapter = {
  id: "projects",
  label: "Projects",
  href: "/projects",
  number: "01",
  description: "Selected work, case studies, and the things that broke along the way.",
} as const;

const arcadeChapter = {
  id: "arcade",
  label: "Arcade",
  href: "/arcade",
  number: "02",
  description: "Playable ports of the games that started all of this.",
} as const;

const askChapter = {
  id: "ask",
  label: "Ask My AI",
  href: "/ask",
  number: "03",
  description: "An AI guide to my work, experience, and the questions recruiters actually ask.",
} as const;

const contactChapter = {
  id: "contact",
  label: "Contact",
  href: "/contact",
  number: "04",
  description: "The fastest ways to reach me.",
} as const;

const aboutChapter = {
  id: "about",
  label: "About",
  href: "/about",
  number: "05",
  description: "The story, the stack, the honors, and the detours.",
} as const;

export const chapters = [
  projectsChapter,
  arcadeChapter,
  askChapter,
  contactChapter,
  aboutChapter,
] as const;

export const chapterContent = {
  projects: projectsChapter,
  arcade: arcadeChapter,
  ask: askChapter,
  contact: contactChapter,
  about: aboutChapter,
} as const;

export const mainMenuChapters = chapters.filter((chapter) => chapter.id !== "contact");
