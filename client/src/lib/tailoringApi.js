import { apiRequest } from "./api.js";

export async function analyzeTailoring(applicationId, jobDescription) {
  const result = await apiRequest("/tailoring/analyze", {
    method: "POST",
    body: { applicationId, jobDescription },
  });
  return result.analysis;
}

export async function saveAnalyzedResume(recommendationId) {
  const result = await apiRequest("/tailoring/save", {
    method: "POST",
    body: { recommendationId },
  });
  return result.resume;
}
