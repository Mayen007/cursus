export const MATCHED_SKILLS = ["JavaScript", "React", "Node.js", "Express", "Git", "REST API"];

export const MISSING_SKILLS = ["MongoDB", "TypeScript", "Docker", "AWS"];

export const WORKFLOW_STEPS = [
  {
    number: "01",
    name: "track",
    description:
      "Log each application once: company, role, platform, status, and a follow-up date.",
    sample: [
      "> add application",
      "company    Mumo Labs",
      "role       Junior MERN Developer",
      "platform   LinkedIn",
      "follow-up  Oct 20",
    ],
  },
  {
    number: "02",
    name: "match",
    description:
      "Paste the job description. Compare its required and preferred skills with your CV.",
    sample: [
      "> match jd.txt base-cv.pdf",
      "+ React       required   matched",
      "+ TypeScript  preferred  missing",
      "score        72",
    ],
  },
  {
    number: "03",
    name: "tailor",
    description: "Review suggestions, accept only what you can back up, and save a tailored CV.",
    sample: [
      "> save tailored-cv.txt",
      "based on   base-cv.pdf",
      "linked to  Mumo Labs / Junior MERN Developer",
      "+ saved",
    ],
  },
];

export const SCORE_PRINCIPLES = [
  {
    title: "Every gap has a reason.",
    description: "Each missing skill points to the job requirement that asked for it.",
  },
  {
    title: "Your CV is never rewritten behind your back.",
    description:
      "Suggestions only reword what is already in your CV. You accept or reject each one.",
  },
  {
    title: "Nothing is invented.",
    description: "No skill, job, date, or qualification is added unless it is already yours.",
  },
];

export const APPLICATION_COLUMNS = [
  {
    status: "Applied",
    color: "border-slate",
    items: [
      { company: "Mumo Labs", role: "Junior MERN Developer", followUp: "Follow up Oct 20" },
      { company: "Pikseli Studio", role: "Frontend Developer" },
      { company: "Acme Systems", role: "Web Developer Intern" },
    ],
  },
  {
    status: "Interview",
    color: "border-score",
    items: [
      { company: "Data Dawa", role: "Python Backend Developer" },
      { company: "Savanna Soft", role: "Junior Developer" },
    ],
  },
  {
    status: "Offer",
    color: "border-match",
    items: [{ company: "Kijani Tech", role: "Junior Developer" }],
  },
  {
    status: "Rejected",
    color: "border-gap",
    items: [{ company: "Northwind Digital", role: "QA Intern" }],
  },
];
