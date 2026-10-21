import { describe, expect, it } from "vitest";
import request from "supertest";
import { APP_NAME } from "../src/config/app.js";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns the service health and security headers", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", app: APP_NAME });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  describe("GET /", () => {
    it("uses the shared health response and allows the configured client origin", async () => {
      const response = await request(app).get("/").set("Origin", "http://localhost:5173");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok", app: APP_NAME });
      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

      const apiHealthResponse = await request(app).get("/api/health");
      expect(response.body).toEqual(apiHealthResponse.body);
    });
  });

  it("returns the standard error format for unknown routes", async () => {
    const response = await request(app).get("/api/not-a-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Route not found: GET /api/not-a-route",
      details: [],
    });
  });
});
