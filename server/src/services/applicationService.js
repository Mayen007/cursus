import mongoose from "mongoose";
import { Application, Recommendation, Resume } from "../models/index.js";

const APPLICATION_STATUSES = ["Applied", "Interview", "Offer", "Rejected"];
const APPLICATION_FIELDS = {
  companyName: { required: true, maxLength: 160 },
  jobTitle: { required: true, maxLength: 160 },
  platform: { maxLength: 100 },
  jobDescription: { maxLength: 50000 },
};

function createError(status, message, details = []) {
  return Object.assign(new Error(message), { status, details });
}

function parseDate(value, field, isRequired = false) {
  if (!value && !isRequired) return null;
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw createError(400, "Please check the submitted details.", [
      `${field} must be a valid date.`,
    ]);
  }
  return date;
}

function validateFields(input, isPartial = false) {
  const details = [];
  const values = {};

  for (const [field, rules] of Object.entries(APPLICATION_FIELDS)) {
    if (isPartial && input[field] === undefined) continue;
    const value = input[field] ?? "";
    if (typeof value !== "string" || (rules.required && !value.trim())) {
      if (rules.required) details.push(`${field} is required.`);
      else if (value !== "") details.push(`${field} must be text.`);
      continue;
    }
    if (value.length > rules.maxLength) {
      details.push(`${field} must be ${rules.maxLength} characters or fewer.`);
    } else {
      values[field] = value.trim();
    }
  }

  if (input.applicationStatus !== undefined) {
    if (!APPLICATION_STATUSES.includes(input.applicationStatus)) {
      details.push("applicationStatus is not supported.");
    } else {
      values.applicationStatus = input.applicationStatus;
    }
  }
  if (input.applicationDate !== undefined) {
    values.applicationDate = parseDate(input.applicationDate, "applicationDate", true);
  }
  if (input.followUpDate !== undefined) {
    values.followUpDate = parseDate(input.followUpDate, "followUpDate");
  }
  if (details.length) {
    throw createError(400, "Please check the submitted details.", details);
  }
  return values;
}

function validateApplicationId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(404, "Application not found.");
  }
}

export function serializeApplication(application) {
  return {
    id: application._id.toString(),
    company: application.companyName,
    jobTitle: application.jobTitle,
    platform: application.platform,
    jobDescription: application.jobDescription,
    status: application.applicationStatus,
    appliedDate: application.applicationDate.toISOString().slice(0, 10),
    followUpDate: application.followUpDate?.toISOString().slice(0, 10) || "",
    statusHistory: application.statusHistory.map((entry) => ({
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      changedAt: entry.changedAt,
    })),
  };
}

export async function listApplications(userId) {
  const applications = await Application.find({ userId }).sort({ applicationDate: -1 });
  return applications.map(serializeApplication);
}

export async function createApplication(userId, input) {
  const values = validateFields(input);
  const status = values.applicationStatus || "Applied";
  const application = await Application.create({
    ...values,
    userId,
    applicationStatus: status,
    statusHistory: [{ toStatus: status }],
  });
  return serializeApplication(application);
}

export async function updateApplication(userId, id, input) {
  validateApplicationId(id);
  const values = validateFields(input, true);
  if (Object.keys(values).length === 0) {
    throw createError(400, "Please check the submitted details.", [
      "At least one application field is required.",
    ]);
  }
  const application = await Application.findOne({ _id: id, userId });
  if (!application) throw createError(404, "Application not found.");

  const nextStatus = values.applicationStatus ?? application.applicationStatus;
  if (nextStatus !== application.applicationStatus) {
    application.statusHistory.push({
      fromStatus: application.applicationStatus,
      toStatus: nextStatus,
      changedAt: new Date(),
    });
  }
  Object.assign(application, values);
  await application.save();
  return serializeApplication(application);
}

export async function changeApplicationStatus(userId, id, applicationStatus) {
  return updateApplication(userId, id, { applicationStatus });
}

export async function deleteApplication(userId, id) {
  validateApplicationId(id);
  const application = await Application.findOneAndDelete({ _id: id, userId });
  if (!application) throw createError(404, "Application not found.");

  await Promise.all([
    Recommendation.deleteMany({ userId, applicationId: id }),
    Resume.updateMany({ userId, applicationId: id }, { $set: { applicationId: null } }),
  ]);
}
