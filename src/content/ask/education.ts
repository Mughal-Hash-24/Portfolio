import type { AskCertification, AskEducation } from "./types";

const LINKEDIN_CERTIFICATIONS =
  "https://www.linkedin.com/in/muhammad-ibtisaam-amjad/details/certifications/";

export const askEducation: AskEducation[] = [
  {
    id: "fast-nuces",
    institution: "National University of Computer and Emerging Sciences, Islamabad Campus",
    credential: "BS Computer Science",
    period: "August 2024 – June 2028",
    location: "Islamabad, Pakistan",
    details: ["CGPA 3.86"],
    keywords: [
      "fast",
      "fast-nuces",
      "university",
      "degree",
      "bachelor",
      "bs computer science",
      "cs",
      "cgpa",
      "3.86",
      "graduation",
      "2028",
    ],
  },
  {
    id: "punjab-college",
    institution: "Punjab College, Ayub Park Campus",
    credential: "Intermediate in Computer Science",
    period: "2022 – 2024",
    location: "Rawalpindi, Pakistan",
    details: ["Federal Board", "982/1100"],
    keywords: ["punjab college", "intermediate", "ics", "federal board", "982", "pre-engineering"],
  },
  {
    id: "fauji-foundation",
    institution: "Fauji Foundation College for Boys, New Lalazar",
    credential: "Matriculation, Science Group (Biology)",
    period: "2020 – 2022",
    location: "Rawalpindi, Pakistan",
    details: ["Federal Board", "1074/1100"],
    keywords: [
      "fauji foundation",
      "matric",
      "matriculation",
      "science",
      "biology",
      "1074",
      "federal board",
    ],
  },
];

export const askCertifications: AskCertification[] = [
  {
    id: "ordered-data-structures",
    name: "Ordered Data Structures",
    issuer: "University of Illinois Urbana-Champaign",
    date: "July 2025",
    verificationUrl: "https://coursera.org/verify/370QBDECHH85",
    keywords: [
      "ordered data structures",
      "data structures",
      "coursera",
      "illinois",
      "certification",
      "certificate",
    ],
  },
  {
    id: "word-associate",
    name: "Microsoft Office Specialist: Word Associate",
    issuer: "Microsoft",
    date: "December 2022",
    credentialId: "ryLc-uSJG",
    verificationUrl: LINKEDIN_CERTIFICATIONS,
    keywords: [
      "microsoft office specialist",
      "word associate",
      "microsoft",
      "certification",
      "certificate",
    ],
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    issuer: "Digital Youth Pakistan",
    date: "August 2021",
    verificationUrl: LINKEDIN_CERTIFICATIONS,
    keywords: [
      "graphic designer",
      "graphic design",
      "digital youth pakistan",
      "certification",
      "certificate",
    ],
  },
];
