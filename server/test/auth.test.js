import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";

const {
  mockUserCreate,
  mockUserFindOne,
  mockUserFindById,
  mockUserFindByIdAndUpdate,
  mockUserDeleteOne,
  mockApplicationDeleteMany,
  mockResumeDeleteMany,
  mockRecommendationDeleteMany,
} = vi.hoisted(() => ({
  mockUserCreate: vi.fn(),
  mockUserFindOne: vi.fn(),
  mockUserFindById: vi.fn(),
  mockUserFindByIdAndUpdate: vi.fn(),
  mockUserDeleteOne: vi.fn(),
  mockApplicationDeleteMany: vi.fn(),
  mockResumeDeleteMany: vi.fn(),
  mockRecommendationDeleteMany: vi.fn(),
}));

vi.mock("../src/models/index.js", () => ({
  User: {
    create: mockUserCreate,
    findOne: mockUserFindOne,
    findById: mockUserFindById,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
    deleteOne: mockUserDeleteOne,
  },
  Application: { deleteMany: mockApplicationDeleteMany },
  Resume: { deleteMany: mockResumeDeleteMany },
  Recommendation: { deleteMany: mockRecommendationDeleteMany },
}));

vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-hs256");

const { default: app } = await import("../src/app.js");
const { Application, Recommendation, Resume, User } = await import("../src/models/index.js");

const userId = "507f1f77bcf86cd799439011";
const userDetails = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "secure-password",
};

function mockFindOne(user) {
  User.findOne.mockReturnValue({
    select: vi.fn().mockResolvedValue(user),
  });
}

describe("authentication routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user with a normalized email and a hashed password", async () => {
    User.create.mockImplementation(async (details) => ({
      ...details,
      _id: userId,
    }));

    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...userDetails, email: " Ada@Example.com " });

    expect(response.status).toBe(201);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: expect.stringMatching(/^scrypt\$/),
      })
    );
    expect(response.body.user).toEqual({
      id: userId,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });
    expect(response.body.user.password).toBeUndefined();
    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
  });

  it("rejects a short password and a duplicate email", async () => {
    const invalidResponse = await request(app)
      .post("/api/auth/register")
      .send({ ...userDetails, password: "short" });
    User.create.mockRejectedValue({ code: 11000 });
    const duplicateResponse = await request(app).post("/api/auth/register").send(userDetails);

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.details).toContain(
      "Password must be between 8 and 128 characters."
    );
    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error).toContain("already exists");
  });

  it("logs in with valid credentials and gives a generic error for a bad password", async () => {
    User.create.mockImplementation(async (details) => ({ ...details, _id: userId }));
    const { registerUser } = await import("../src/services/authService.js");
    await registerUser(userDetails);
    const passwordHash = User.create.mock.calls[0][0].password;
    const user = {
      _id: userId,
      fullName: userDetails.fullName,
      email: userDetails.email,
      password: passwordHash,
    };
    mockFindOne(user);
    const success = await request(app)
      .post("/api/auth/login")
      .send({ email: userDetails.email, password: userDetails.password });
    const failure = await request(app)
      .post("/api/auth/login")
      .send({ email: userDetails.email, password: "incorrect-pass" });

    expect(success.status).toBe(200);
    expect(success.body.user.email).toBe(userDetails.email);
    expect(failure.status).toBe(401);
    expect(failure.body.error).toBe("Email or password is incorrect.");
  });

  it("validates the token for /me and does not return password data", async () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, {
      algorithm: "HS256",
      subject: userId,
      expiresIn: "7d",
    });
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: userId,
        fullName: userDetails.fullName,
        email: userDetails.email,
      }),
    });

    const authorized = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    const unauthorized = await request(app).get("/api/auth/me");

    expect(authorized.status).toBe(200);
    expect(authorized.body).toEqual({
      user: { id: userId, fullName: userDetails.fullName, email: userDetails.email },
    });
    expect(unauthorized.status).toBe(401);
  });

  it("limits repeated login attempts", async () => {
    mockFindOne(null);
    let response;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      response = await request(app)
        .post("/api/auth/login")
        .send({ email: userDetails.email, password: userDetails.password });
    }

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: "Too many login attempts. Try again later.",
      details: [],
    });
  });

  it("updates the profile from the verified user id", async () => {
    User.findByIdAndUpdate.mockResolvedValue({
      _id: userId,
      fullName: "Ada Byron",
      email: "ada@example.com",
    });

    const response = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${jwt.sign({}, process.env.JWT_SECRET, { subject: userId })}`)
      .send({ fullName: "Ada Byron", email: "ada@example.com", userId: "untrusted" });

    expect(response.status).toBe(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { fullName: "Ada Byron", email: "ada@example.com" },
      { new: true, runValidators: true }
    );
  });

  it("changes a password only after verifying the current password", async () => {
    User.create.mockImplementation(async (details) => ({ ...details, _id: userId }));
    const { registerUser } = await import("../src/services/authService.js");
    await registerUser(userDetails);
    const savedUser = {
      _id: userId,
      password: User.create.mock.calls[0][0].password,
      save: vi.fn().mockResolvedValue(undefined),
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(savedUser) });

    const failed = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${jwt.sign({}, process.env.JWT_SECRET, { subject: userId })}`)
      .send({ currentPassword: "wrong-password", newPassword: "new-password-123" });
    const changed = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${jwt.sign({}, process.env.JWT_SECRET, { subject: userId })}`)
      .send({ currentPassword: userDetails.password, newPassword: "new-password-123" });

    expect(failed.status).toBe(401);
    expect(changed.status).toBe(204);
    expect(savedUser.save).toHaveBeenCalledOnce();
    expect(savedUser.password).not.toBe(User.create.mock.calls[0][0].password);
  });

  it("deletes every user-scoped record after password confirmation", async () => {
    User.create.mockImplementation(async (details) => ({ ...details, _id: userId }));
    const { registerUser } = await import("../src/services/authService.js");
    await registerUser(userDetails);
    const savedUser = {
      _id: userId,
      password: User.create.mock.calls[0][0].password,
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(savedUser) });
    User.deleteOne.mockResolvedValue({ deletedCount: 1 });
    Application.deleteMany.mockResolvedValue({ deletedCount: 0 });
    Resume.deleteMany.mockResolvedValue({ deletedCount: 0 });
    Recommendation.deleteMany.mockResolvedValue({ deletedCount: 0 });

    const response = await request(app)
      .delete("/api/auth/me")
      .set("Authorization", `Bearer ${jwt.sign({}, process.env.JWT_SECRET, { subject: userId })}`)
      .send({ password: userDetails.password });

    expect(response.status).toBe(204);
    expect(Application.deleteMany).toHaveBeenCalledWith({ userId });
    expect(Resume.deleteMany).toHaveBeenCalledWith({ userId });
    expect(Recommendation.deleteMany).toHaveBeenCalledWith({ userId });
    expect(User.deleteOne).toHaveBeenCalledWith({ _id: userId });
  });
});
