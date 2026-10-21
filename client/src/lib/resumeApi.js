import { apiRequest } from "./api.js";

export function getResumes() {
  return apiRequest("/resumes");
}

export async function uploadBaseResume(file) {
  const body = new FormData();
  body.append("file", file);
  const result = await apiRequest("/resumes/base", { method: "POST", body });
  return result.resume;
}

export function deleteResume(id) {
  return apiRequest(`/resumes/${id}`, { method: "DELETE" });
}
