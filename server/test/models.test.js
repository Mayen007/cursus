import { describe, expect, it } from "vitest";
import { Application, Recommendation, Resume, User } from "../src/models/index.js";

describe("data models", () => {
  it("keeps user passwords out of normal query results", () => {
    expect(User.schema.path("password").options.select).toBe(false);
    expect(User.schema.path("email").options.unique).toBe(true);
  });

  it("requires user ownership for user data", () => {
    expect(Resume.schema.path("userId").isRequired).toBe(true);
    expect(Application.schema.path("userId").isRequired).toBe(true);
    expect(Recommendation.schema.path("userId").isRequired).toBe(true);
  });

  it("matches proposal collection fields and keeps only required schema additions", () => {
    expect(Object.keys(User.schema.paths).sort()).toEqual(
      ["_id", "__v", "createdAt", "email", "fullName", "password"].sort()
    );
    expect(Object.keys(Application.schema.paths).sort()).toEqual(
      [
        "_id",
        "__v",
        "applicationDate",
        "applicationStatus",
        "companyName",
        "followUpDate",
        "jobDescription",
        "jobTitle",
        "platform",
        "statusHistory",
        "userId",
      ].sort()
    );
    expect(Object.keys(Recommendation.schema.paths).sort()).toEqual(
      [
        "_id",
        "__v",
        "applicationId",
        "matchScore",
        "missingKeywords",
        "recommendations",
        "resumeId",
        "userId",
      ].sort()
    );
  });

  it("defaults a new application to Applied and records its initial status", () => {
    const application = new Application({
      userId: "507f1f77bcf86cd799439011",
      companyName: "Example Ltd",
      jobTitle: "Junior Developer",
    });

    expect(application.applicationStatus).toBe("Applied");
    expect(application.statusHistory).toHaveLength(1);
    expect(application.statusHistory[0].toStatus).toBe("Applied");
  });

  it("constrains match scores to integer percentages", async () => {
    const recommendation = new Recommendation({
      userId: "507f1f77bcf86cd799439011",
      applicationId: "507f1f77bcf86cd799439012",
      resumeId: "507f1f77bcf86cd799439013",
      matchScore: 101,
    });

    await expect(recommendation.validate()).rejects.toThrow();
  });

  it("matches the proposed resume fields without storing a match score", async () => {
    const resume = new Resume({
      userId: "507f1f77bcf86cd799439011",
      fileName: "resume.pdf",
      extractedText: "CV text",
      isBaseResume: true,
      matchScore: 88,
    });

    await expect(resume.validate()).resolves.toBeUndefined();
    expect(Resume.schema.path("matchScore")).toBeUndefined();
    expect(resume.toObject()).not.toHaveProperty("matchScore");
  });

  it("assigns each resume an ID and manages creation and update timestamps", () => {
    expect(Resume.schema.path("_id")).toBeDefined();
    expect(Resume.schema.path("createdAt")).toBeDefined();
    expect(Resume.schema.path("updatedAt")).toBeDefined();
    expect(Resume.schema.options.timestamps).toBe(true);
  });
});
