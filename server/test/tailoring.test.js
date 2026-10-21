import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const {
  mockApplicationFindOne,
  mockResumeFindOne,
  mockResumeCreate,
  mockRecommendationFindOne,
  mockRecommendationCreate,
} = vi.hoisted(() => ({
  mockApplicationFindOne: vi.fn(),
  mockResumeFindOne: vi.fn(),
  mockResumeCreate: vi.fn(),
  mockRecommendationFindOne: vi.fn(),
  mockRecommendationCreate: vi.fn(),
}));

vi.mock("../src/models/index.js", () => ({
  Application: { findOne: mockApplicationFindOne },
  Resume: { findOne: mockResumeFindOne, create: mockResumeCreate },
  Recommendation: { findOne: mockRecommendationFindOne, create: mockRecommendationCreate },
  User: {},
}));
vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-hs256");

const { default: app } = await import("../src/app.js");
const userId = "507f1f77bcf86cd799439011";
const applicationId = "507f1f77bcf86cd799439012";
const resumeId = "507f1f77bcf86cd799439013";
const recommendationId = "507f1f77bcf86cd799439014";
const token = (await import("jsonwebtoken")).default.sign({}, process.env.JWT_SECRET, {
  algorithm: "HS256",
  subject: userId,
});

const application = {
  _id: applicationId,
  companyName: "Example",
  jobTitle: "Developer",
  jobDescription: "",
};
const baseResume = {
  _id: resumeId,
  fileName: "base.pdf",
  extractedText: "Experienced React and JavaScript developer.",
};
const recommendation = {
  _id: recommendationId,
  applicationId,
  resumeId,
  matchScore: 67,
};

function authorized(method, path) {
  return request(app)[method](path).set("Authorization", `Bearer ${token}`);
}

describe("tailoring routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates and persists a deterministic, explainable score for owned records", async () => {
    mockApplicationFindOne.mockResolvedValue(application);
    mockResumeFindOne.mockResolvedValue(baseResume);
    mockRecommendationCreate.mockResolvedValue({ _id: recommendationId });

    const response = await authorized("post", "/api/tailoring/analyze").send({
      applicationId,
      jobDescription: "REQUIRED\nReact developer\nPREFERRED\nNode.js experience",
    });

    expect(response.status).toBe(200);
    expect(response.body.analysis).toMatchObject({
      score: 67,
      application: { company: "Example", jobTitle: "Developer" },
      recommendationId,
      missingKeywords: [
        {
          label: "Node.js",
          type: "preferred",
          sourceLine: "Node.js experience",
          lineNumber: 4,
        },
      ],
    });
    expect(mockApplicationFindOne).toHaveBeenCalledWith({ _id: applicationId, userId });
    expect(mockResumeFindOne).toHaveBeenCalledWith({ userId, isBaseResume: true });
    expect(mockRecommendationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId, applicationId, resumeId, matchScore: 67 })
    );
  });

  it("rejects analysis if the application is not owned by the user", async () => {
    mockApplicationFindOne.mockResolvedValue(null);

    const response = await authorized("post", "/api/tailoring/analyze").send({
      applicationId,
      jobDescription: "React developer",
    });

    expect(response.status).toBe(404);
    expect(mockResumeFindOne).not.toHaveBeenCalled();
  });

  it("requires a saved base CV before analyzing", async () => {
    mockApplicationFindOne.mockResolvedValue(application);
    mockResumeFindOne.mockResolvedValue(null);

    const response = await authorized("post", "/api/tailoring/analyze").send({
      applicationId,
      jobDescription: "React developer",
    });

    expect(response.status).toBe(409);
  });

  it("saves the base CV text unchanged and links it to the analysis", async () => {
    mockRecommendationFindOne.mockResolvedValue(recommendation);
    mockResumeFindOne.mockResolvedValue(baseResume);
    mockApplicationFindOne.mockResolvedValue(application);
    mockResumeCreate.mockResolvedValue({
      _id: "507f1f77bcf86cd799439015",
      fileName: "base.pdf - Example",
      extractedText: baseResume.extractedText,
      createdAt: new Date("2026-10-13T00:00:00.000Z"),
    });

    const response = await authorized("post", "/api/tailoring/save").send({ recommendationId });

    expect(response.status).toBe(201);
    expect(mockRecommendationFindOne).toHaveBeenCalledWith({ _id: recommendationId, userId });
    expect(mockResumeCreate).toHaveBeenCalledWith({
      userId,
      fileName: "base.pdf - Example",
      extractedText: baseResume.extractedText,
      isBaseResume: false,
      tailoredFromResumeId: resumeId,
      applicationId,
    });
    expect(response.body.resume.extractedText).toBe(baseResume.extractedText);
  });
});
