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

export const chapters = [
  { id: "projects", label: "Projects" },
  { id: "arcade", label: "Arcade" },
  { id: "ask", label: "Ask My AI" },
  { id: "contact", label: "Contact" },
  { id: "about", label: "About" },
] as const;

export const mainMenuChapters = chapters.filter((chapter) => chapter.id !== "contact");
