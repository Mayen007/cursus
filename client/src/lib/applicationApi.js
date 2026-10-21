import { apiRequest } from "./api.js";

function toRequestBody(application) {
  return {
    companyName: application.company,
    jobTitle: application.jobTitle,
    platform: application.platform,
    applicationDate: application.appliedDate,
    applicationStatus: application.status,
    followUpDate: application.followUpDate || null,
    jobDescription: application.jobDescription,
  };
}

export async function getApplications() {
  const result = await apiRequest("/applications");
  return result.applications;
}

export async function createApplication(application) {
  const result = await apiRequest("/applications", {
    method: "POST",
    body: toRequestBody(application),
  });
  return result.application;
}

export async function updateApplication(application) {
  const result = await apiRequest(`/applications/${application.id}`, {
    method: "PATCH",
    body: toRequestBody(application),
  });
  return result.application;
}

export async function updateApplicationStatus(id, status) {
  const result = await apiRequest(`/applications/${id}/status`, {
    method: "PATCH",
    body: { applicationStatus: status },
  });
  return result.application;
}

export function deleteApplication(id) {
  return apiRequest(`/applications/${id}`, { method: "DELETE" });
}
