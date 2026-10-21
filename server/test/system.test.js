import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { zipSync } from "fflate";
import mongoose from "mongoose";

vi.stubEnv("JWT_SECRET", "system-test-secret-that-is-long-enough-for-hs256");

const { default: app } = await import("../src/app.js");
const { Application, Recommendation, Resume, User } = await import("../src/models/index.js");
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI;
const createdUserIds = [];

if (process.env.npm_lifecycle_event === "test:system" && !TEST_MONGODB_URI) {
  throw new Error("Set TEST_MONGODB_URI to a disposable database before running the system test.");
}

async function registerAccount(email) {
  const response = await request(app).post("/api/auth/register").send({
    fullName: "System Test User",
    email,
    password: "system-test-password",
  });
  expect(response.status).toBe(201);
  createdUserIds.push(response.body.user.id);
  return response.body;
}

function createDocx(text) {
  const xml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`;
  return zipSync({
    "[Content_Types].xml": Buffer.from("<Types/>"),
    "word/document.xml": Buffer.from(xml),
  });
}

describe.skipIf(!TEST_MONGODB_URI)("MongoDB-backed workspace flow", () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_MONGODB_URI);
  });

  afterAll(async () => {
    for (const userId of createdUserIds) {
      await Promise.all([
        Application.deleteMany({ userId }),
        Recommendation.deleteMany({ userId }),
        Resume.deleteMany({ userId }),
        User.deleteOne({ _id: userId }),
      ]);
    }
    await mongoose.disconnect();
  });

  it("registers isolated accounts and persists an application-to-CV analysis flow", async () => {
    const email = `system-${Date.now()}@example.test`;
    const account = await registerAccount(email);
    const passwordHash = await User.findById(account.user.id).select("+password");
    expect(passwordHash.password).toMatch(/^\$2[aby]\$/);

    const createdApplication = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${account.token}`)
      .send({
        companyName: "System Test Company",
        jobTitle: "Developer",
        applicationDate: "2026-10-21",
        jobDescription: "REQUIRED\nReact\nPREFERRED\nTypeScript",
      });

    expect(createdApplication.status).toBe(201);
    const applicationId = createdApplication.body.application.id;
    const statusChange = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${account.token}`)
      .send({ applicationStatus: "Interview" });

    expect(statusChange.body.application.statusHistory).toHaveLength(2);

    const resumeText =
      "Experienced developer with React, JavaScript, Node.js, Git, and accessible interface experience. "
        .repeat(2)
        .trim();
    const uploadedResume = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${account.token}`)
      .attach("file", Buffer.from(createDocx(resumeText)), "resume.docx");

    expect(uploadedResume.status).toBe(201);
    expect(uploadedResume.body.resume.extractedText).toBe(resumeText);

    const analysis = await request(app)
      .post("/api/tailoring/analyze")
      .set("Authorization", `Bearer ${account.token}`)
      .send({ applicationId });

    expect(analysis.status).toBe(200);
    expect(analysis.body.analysis).toMatchObject({
      score: 67,
      missingKeywords: [{ label: "TypeScript", lineNumber: 4 }],
    });

    const savedCopy = await request(app)
      .post("/api/tailoring/save")
      .set("Authorization", `Bearer ${account.token}`)
      .send({ recommendationId: analysis.body.analysis.recommendationId });

    expect(savedCopy.status).toBe(201);
    expect(savedCopy.body.resume.extractedText).toBe(resumeText);
    expect(savedCopy.body.resume.applicationId).toBe(applicationId);

    const otherAccount = await registerAccount(`other-${Date.now()}@example.test`);
    const otherApplications = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${otherAccount.token}`);
    expect(otherApplications.body.applications).toEqual([]);

    const persistedResumes = await request(app)
      .get("/api/resumes")
      .set("Authorization", `Bearer ${account.token}`);
    expect(persistedResumes.body.tailoredResumes).toHaveLength(1);
    expect(persistedResumes.body.tailoredResumes[0].applicationId).toBe(applicationId);
  });
});
