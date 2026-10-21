import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { mockFind, mockCreate, mockFindOne, mockFindOneAndDelete, mockDeleteMany, mockUpdateMany } =
  vi.hoisted(() => ({
    mockFind: vi.fn(),
    mockCreate: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
    mockDeleteMany: vi.fn(),
    mockUpdateMany: vi.fn(),
  }));

vi.mock("../src/models/index.js", () => ({
  Application: {
    find: mockFind,
    create: mockCreate,
    findOne: mockFindOne,
    findOneAndDelete: mockFindOneAndDelete,
  },
  Recommendation: { deleteMany: mockDeleteMany },
  Resume: { updateMany: mockUpdateMany },
  User: {},
}));

vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-hs256");

const { default: app } = await import("../src/app.js");
const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439012";
const applicationId = "507f1f77bcf86cd799439013";
const jwt = await import("jsonwebtoken");
const token = jwt.default.sign({}, process.env.JWT_SECRET, {
  algorithm: "HS256",
  subject: userId,
});
const otherUserToken = jwt.default.sign({}, process.env.JWT_SECRET, {
  algorithm: "HS256",
  subject: otherUserId,
});
const validApplication = {
  companyName: "Example Ltd",
  jobTitle: "Junior developer",
  applicationDate: "2026-10-13",
};

function applicationRecord(overrides = {}) {
  return {
    _id: applicationId,
    companyName: "Example Ltd",
    jobTitle: "Junior developer",
    platform: "",
    jobDescription: "",
    applicationStatus: "Applied",
    applicationDate: new Date("2026-10-13T00:00:00.000Z"),
    followUpDate: null,
    statusHistory: [{ fromStatus: null, toStatus: "Applied", changedAt: new Date() }],
    ...overrides,
  };
}

function authorize(requestBuilder) {
  return requestBuilder.set("Authorization", `Bearer ${token}`);
}

describe("application routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only the authenticated user's applications", async () => {
    mockFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue([applicationRecord()]),
    });

    const response = await authorize(request(app).get("/api/applications"));

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(1);
    expect(mockFind).toHaveBeenCalledWith({ userId });
  });

  it("creates an application owned by the authenticated user", async () => {
    mockCreate.mockImplementation(async (values) => applicationRecord(values));

    const response = await authorize(request(app).post("/api/applications")).send(validApplication);

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        companyName: "Example Ltd",
        applicationStatus: "Applied",
        statusHistory: [{ toStatus: "Applied" }],
      })
    );
  });

  it("validates required input and allowed status values", async () => {
    const invalid = await authorize(request(app).post("/api/applications")).send({
      ...validApplication,
      applicationStatus: "Hired",
    });

    expect(invalid.status).toBe(400);
    expect(invalid.body.details).toContain("applicationStatus is not supported.");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("records a status transition only on the owned application", async () => {
    const record = applicationRecord();
    record.save = vi.fn().mockResolvedValue(record);
    mockFindOne.mockResolvedValue(record);

    const response = await authorize(
      request(app).patch(`/api/applications/${applicationId}/status`)
    ).send({ applicationStatus: "Interview" });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: applicationId, userId });
    expect(record.statusHistory.at(-1)).toMatchObject({
      fromStatus: "Applied",
      toStatus: "Interview",
    });
    expect(response.body.application.statusHistory).toHaveLength(2);
    expect(response.body.application.statusHistory[1]).toMatchObject({
      fromStatus: "Applied",
      toStatus: "Interview",
    });
    expect(response.body.application.statusHistory[1].changedAt).toEqual(expect.any(String));
  });

  it("does not return another user's application", async () => {
    mockFindOne.mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ companyName: "Changed name" });

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: applicationId, userId: otherUserId });
  });

  it("deletes associated analysis data without crossing user boundaries", async () => {
    mockFindOneAndDelete.mockResolvedValue(applicationRecord());
    mockDeleteMany.mockResolvedValue({ deletedCount: 1 });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 1 });

    const response = await authorize(request(app).delete(`/api/applications/${applicationId}`));

    expect(response.status).toBe(204);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: applicationId, userId });
    expect(mockDeleteMany).toHaveBeenCalledWith({ userId, applicationId });
    expect(mockUpdateMany).toHaveBeenCalledWith(
      { userId, applicationId },
      { $set: { applicationId: null } }
    );
  });
});
