import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { zipSync } from "fflate";

const { mockResumeFind, mockResumeFindOne, mockResumeCreate, mockFindOneAndDelete, mockPdfParse } =
  vi.hoisted(() => ({
    mockResumeFind: vi.fn(),
    mockResumeFindOne: vi.fn(),
    mockResumeCreate: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
    mockPdfParse: vi.fn(),
  }));

vi.mock("../src/models/index.js", () => ({
  Resume: {
    find: mockResumeFind,
    findOne: mockResumeFindOne,
    create: mockResumeCreate,
    findOneAndDelete: mockFindOneAndDelete,
  },
  User: {},
  Application: {},
  Recommendation: {},
}));
vi.mock("pdf-parse/lib/pdf-parse.js", () => ({ default: mockPdfParse }));
vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-hs256");

const { default: app } = await import("../src/app.js");
const userId = "507f1f77bcf86cd799439011";
const token = (await import("jsonwebtoken")).default.sign({}, process.env.JWT_SECRET, {
  algorithm: "HS256",
  subject: userId,
});

function baseResume(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439012",
    userId,
    fileName: "resume.pdf",
    extractedText: "A".repeat(120),
    isBaseResume: true,
    tailoredFromResumeId: null,
    applicationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("resume routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication to list CV data", async () => {
    const response = await request(app).get("/api/resumes");
    expect(response.status).toBe(401);
  });

  it("returns a clear error when an upload exceeds the size limit", async () => {
    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.alloc(5 * 1024 * 1024 + 1), "large.pdf", {
        contentType: "application/pdf",
      });

    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      error: "The file must be 5 MB or smaller.",
      details: [],
    });
    expect(mockResumeCreate).not.toHaveBeenCalled();
  });

  it("extracts PDF text into a user-owned base CV without saving the file", async () => {
    const resume = baseResume();
    mockPdfParse.mockResolvedValue({ text: "A".repeat(120) });
    mockResumeFindOne.mockResolvedValue(null);
    mockResumeCreate.mockResolvedValue(resume);

    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-example"), "resume.pdf", {
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(mockResumeCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId, fileName: "resume.pdf", isBaseResume: true })
    );
    expect(mockResumeCreate.mock.calls[0][0]).not.toHaveProperty("file");
    expect(response.body.resume.extractedText).toHaveLength(120);
  });

  it("accepts a PDF header within the first 1024 bytes", async () => {
    const resume = baseResume();
    mockPdfParse.mockResolvedValue({ text: "A".repeat(120) });
    mockResumeFindOne.mockResolvedValue(null);
    mockResumeCreate.mockResolvedValue(resume);

    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("\n%PDF-example"), "resume.pdf", {
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(mockPdfParse).toHaveBeenCalled();
  });

  it("rejects scans with fewer than 100 extracted characters", async () => {
    mockPdfParse.mockResolvedValue({ text: "Only a few words." });
    mockResumeFindOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-example"), "scan.pdf", { contentType: "application/pdf" });

    expect(response.status).toBe(422);
    expect(response.body.error).toContain("too little readable text");
    expect(mockResumeCreate).not.toHaveBeenCalled();
  });

  it("extracts paragraphs from a DOCX document", async () => {
    const extractedText = "Experienced developer with React and JavaScript. ".repeat(4);
    const docx = zipSync({
      "[Content_Types].xml": Buffer.from("<Types/>"),
      "word/document.xml": Buffer.from(
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${extractedText}</w:t></w:r></w:p></w:body></w:document>`
      ),
    });
    mockResumeFindOne.mockResolvedValue(null);
    mockResumeCreate.mockResolvedValue(baseResume({ fileName: "resume.docx", extractedText }));

    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(docx), "resume.docx", {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(response.status).toBe(201);
    expect(response.body.resume.extractedText).toBe(extractedText);
  });

  it("updates only the authenticated user's existing base CV", async () => {
    const resume = baseResume();
    const replacement = baseResume({
      _id: "507f1f77bcf86cd799439015",
      fileName: "updated.pdf",
      extractedText: "B".repeat(120),
    });
    mockPdfParse.mockResolvedValue({ text: "B".repeat(120) });
    mockResumeFindOne.mockResolvedValue(resume);
    mockResumeCreate.mockResolvedValue(replacement);

    const response = await request(app)
      .post("/api/resumes/base")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-example"), "updated.pdf", {
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(mockResumeFindOne).toHaveBeenCalledWith({ userId, isBaseResume: true });
    expect(resume.save).toHaveBeenCalled();
    expect(resume.isBaseResume).toBe(false);
    expect(mockResumeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        fileName: "updated.pdf",
        extractedText: "B".repeat(120),
        isBaseResume: true,
      })
    );
    expect(response.body.resume.fileName).toBe("updated.pdf");
  });

  it("returns owned base and tailored CVs as separate results", async () => {
    const base = baseResume();
    const tailored = baseResume({
      _id: "507f1f77bcf86cd799439013",
      isBaseResume: false,
      applicationId: { _id: "507f1f77bcf86cd799439014", companyName: "Example", jobTitle: "Dev" },
      tailoredFromResumeId: { fileName: "resume.pdf" },
    });
    const query = {};
    query.sort = vi.fn(() => query);
    query.populate = vi.fn(() => query);
    query.then = (resolve) => resolve([tailored, base]);
    mockResumeFind.mockReturnValue(query);

    const response = await request(app).get("/api/resumes").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(mockResumeFind).toHaveBeenCalledWith({ userId });
    expect(response.body.baseResume.id).toBe(base._id);
    expect(response.body.tailoredResumes[0]).toMatchObject({
      id: tailored._id,
      company: "Example",
    });
    expect(response.body.tailoredResumes[0]).not.toHaveProperty("matchScore");
  });
});
