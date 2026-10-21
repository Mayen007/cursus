import mongoose from "mongoose";
import { Application, Recommendation, Resume } from "../models/index.js";

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

function createError(status, message, details = []) {
  return Object.assign(new Error(message), { status, details });
}

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
          label: keyword.label,
          type: getKeywordType(line) === "preferred" ? "preferred" : sectionType,
          sourceLine: line.trim(),
          lineNumber: lineIndex + 1,
          aliases: keyword.aliases,
        })
      );
    })
    .filter(
      (keyword, index, keywords) =>
        keywords.findIndex(({ label }) => label === keyword.label) === index
    );
}

function analyzeResumeMatch(resumeText, jobDescription) {
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
    keywords: keywords.map(({ label, type, sourceLine, lineNumber }) => ({
      label,
      type,
      sourceLine,
      lineNumber,
    })),
    matchedKeywords: matchedKeywords.map(({ label, type, sourceLine, lineNumber }) => ({
      label,
      type,
      sourceLine,
      lineNumber,
    })),
    missingKeywords: missingKeywords.map(({ label, type, sourceLine, lineNumber }) => ({
      label,
      type,
      sourceLine,
      lineNumber,
    })),
    score: totalWeight ? Math.round((100 * matchedWeight) / totalWeight) : null,
  };
}

function validateObjectId(id, entityName) {
  if (!mongoose.isValidObjectId(id)) throw createError(404, `${entityName} not found.`);
}

export async function analyzeTailoring(userId, input) {
  validateObjectId(input.applicationId, "Application");
  const application = await Application.findOne({ _id: input.applicationId, userId });
  if (!application) throw createError(404, "Application not found.");

  const baseResume = await Resume.findOne({ userId, isBaseResume: true });
  if (!baseResume) throw createError(409, "Upload a base CV before analyzing a job description.");

  const jobDescription =
    typeof input.jobDescription === "string" && input.jobDescription.trim()
      ? input.jobDescription.trim()
      : application.jobDescription;
  if (!jobDescription) {
    throw createError(400, "Add a job description before analyzing this application.");
  }
  if (jobDescription.length > 50000) {
    throw createError(400, "Job description must be 50,000 characters or fewer.");
  }

  const analysis = analyzeResumeMatch(baseResume.extractedText, jobDescription);
  let recommendationId = null;
  if (analysis.score !== null) {
    const recommendation = await Recommendation.create({
      userId,
      applicationId: application._id,
      resumeId: baseResume._id,
      matchScore: analysis.score,
      missingKeywords: analysis.missingKeywords.map((keyword) => ({
        keyword: keyword.label,
        type: keyword.type,
        reason: keyword.sourceLine,
        sourceLine: keyword.sourceLine,
        lineNumber: keyword.lineNumber,
      })),
      recommendations: analysis.missingKeywords.map((keyword) => ({
        keyword: keyword.label,
        reason: `Job description line ${keyword.lineNumber}: ${keyword.sourceLine}`,
      })),
    });
    recommendationId = recommendation._id.toString();
  }

  return {
    ...analysis,
    recommendationId,
    application: {
      id: application._id.toString(),
      company: application.companyName,
      jobTitle: application.jobTitle,
    },
    resumeId: baseResume._id.toString(),
  };
}

export async function saveAnalyzedResume(userId, recommendationId) {
  validateObjectId(recommendationId, "Analysis");
  const recommendation = await Recommendation.findOne({ _id: recommendationId, userId });
  if (!recommendation) throw createError(404, "Analysis not found.");

  const baseResume = await Resume.findOne({
    _id: recommendation.resumeId,
    userId,
    isBaseResume: true,
  });
  if (!baseResume) throw createError(404, "The base CV for this analysis was not found.");

  const application = await Application.findOne({
    _id: recommendation.applicationId,
    userId,
  });
  if (!application) throw createError(404, "Application not found.");

  const resume = await Resume.create({
    userId,
    fileName: `${baseResume.fileName} - ${application.companyName}`,
    extractedText: baseResume.extractedText,
    isBaseResume: false,
    tailoredFromResumeId: baseResume._id,
    applicationId: application._id,
  });
  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    extractedText: resume.extractedText,
    isBaseResume: false,
    tailoredFromResumeId: baseResume._id.toString(),
    applicationId: application._id.toString(),
    company: application.companyName,
    jobTitle: application.jobTitle,
    baseResume: baseResume.fileName,
    createdAt: resume.createdAt,
  };
}
