const KEYWORD_CATALOG = [
  { label: "JavaScript", aliases: ["JavaScript", "JS"] },
  { label: "React", aliases: ["React", "React.js"] },
  { label: "TypeScript", aliases: ["TypeScript", "TS"] },
  { label: "Node.js", aliases: ["Node.js", "Node"] },
  { label: "REST APIs", aliases: ["REST APIs", "REST API", "RESTful APIs"] },
  { label: "Git", aliases: ["Git"] },
  { label: "Accessibility", aliases: ["Accessibility", "a11y"] },
  { label: "Unit testing", aliases: ["Unit testing", "unit tests"] },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesAlias(text, aliases) {
  return aliases.some((alias) => {
    const prefix = alias.toLowerCase() === "js" ? "[^\\p{L}\\p{N}.]" : "[^\\p{L}\\p{N}]";
    return new RegExp(`(^|${prefix})${escapeRegExp(alias)}([^\\p{L}\\p{N}]|$)`, "iu").test(text);
  });
}

function getKeywordType(line) {
  return /preferred|nice[- ]to[- ]have|bonus/i.test(line) ? "preferred" : "required";
}

function extractKeywords(jobDescription) {
  let sectionType = "required";

  return jobDescription
    .split(/\r?\n/)
    .flatMap((line, lineIndex) => {
      if (/^\s*(preferred|nice[- ]to[- ]have|bonus)\s*:?\s*$/i.test(line)) {
        sectionType = "preferred";
      }
      if (/^\s*required\s*:?\s*$/i.test(line)) sectionType = "required";

      return KEYWORD_CATALOG.filter(({ aliases }) => includesAlias(line, aliases)).map(
        (keyword) => ({
          ...keyword,
          type: getKeywordType(line) === "preferred" ? "preferred" : sectionType,
          sourceLine: line.trim(),
          lineNumber: lineIndex + 1,
        })
      );
    })
    .filter((keyword, index, keywords) => {
      const firstMatch = keywords.find((item) => item.label === keyword.label);
      return firstMatch === keyword;
    });
}

export function analyzeResumeMatch(resumeText, jobDescription) {
  const keywords = extractKeywords(jobDescription);
  const matchedKeywords = keywords.filter(({ aliases }) => includesAlias(resumeText, aliases));
  const missingKeywords = keywords.filter(({ aliases }) => !includesAlias(resumeText, aliases));
  const totalWeight = keywords.reduce(
    (total, { type }) => total + (type === "required" ? 2 : 1),
    0
  );
  const matchedWeight = matchedKeywords.reduce(
    (total, { type }) => total + (type === "required" ? 2 : 1),
    0
  );

  return {
    keywords,
    matchedKeywords,
    missingKeywords,
    score: totalWeight ? Math.round((100 * matchedWeight) / totalWeight) : null,
  };
}

export const EXAMPLE_RESUME_TEXT = [
  "EXAMPLE CV — replace with your own text",
  "",
  "SKILLS",
  "React, JavaScript, Git, REST APIs, accessibility",
  "",
  "EXPERIENCE",
  "Built accessible interfaces with React and integrated REST APIs.",
].join("\n");

export const EXAMPLE_JOB_DESCRIPTION = [
  "REQUIRED",
  "- React and JavaScript",
  "- Experience with REST APIs",
  "",
  "PREFERRED",
  "- TypeScript and Node.js",
  "- Accessibility and unit testing",
].join("\n");
