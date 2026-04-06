import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Finance Backend API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects protected endpoints without auth", async () => {
    const response = await request(app).get("/api/records");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("authorization");
  });
});
