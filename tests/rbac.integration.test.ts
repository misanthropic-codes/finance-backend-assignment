import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";

type AuthTokens = {
  admin: string;
  analyst: string;
  viewer: string;
};

const tokens: AuthTokens = {
  admin: "",
  analyst: "",
  viewer: "",
};

let targetUserId = "";
let targetRecordId = "";

const authHeader = (token: string): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

async function login(email: string, password: string): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeTypeOf("string");
  return response.body.token as string;
}

beforeAll(async () => {
  await prisma.financeRecord.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const analystPassword = await bcrypt.hash("Analyst123!", 10);
  const viewerPassword = await bcrypt.hash("Viewer123!", 10);
  const targetPassword = await bcrypt.hash("Target123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "rbac-admin@example.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Test Analyst",
      email: "rbac-analyst@example.com",
      passwordHash: analystPassword,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Test Viewer",
      email: "rbac-viewer@example.com",
      passwordHash: viewerPassword,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  const targetUser = await prisma.user.create({
    data: {
      name: "Target User",
      email: "rbac-target@example.com",
      passwordHash: targetPassword,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  targetUserId = targetUser.id;

  const record = await prisma.financeRecord.create({
    data: {
      amount: 1500,
      type: "INCOME",
      category: "Bonus",
      date: new Date("2026-03-01T00:00:00.000Z"),
      notes: "RBAC test record",
      createdById: admin.id,
    },
  });

  targetRecordId = record.id;

  tokens.admin = await login("rbac-admin@example.com", "Admin123!");
  tokens.analyst = await login("rbac-analyst@example.com", "Analyst123!");
  tokens.viewer = await login("rbac-viewer@example.com", "Viewer123!");

  await prisma.user.update({
    where: { id: analyst.id },
    data: { name: analyst.name },
  });

  await prisma.user.update({
    where: { id: viewer.id },
    data: { name: viewer.name },
  });
});

describe("RBAC matrix integration", () => {
  it("allows all roles to read records", async () => {
    const [adminRes, analystRes, viewerRes] = await Promise.all([
      request(app).get("/api/records").set(authHeader(tokens.admin)),
      request(app).get("/api/records").set(authHeader(tokens.analyst)),
      request(app).get("/api/records").set(authHeader(tokens.viewer)),
    ]);

    expect(adminRes.status).toBe(200);
    expect(analystRes.status).toBe(200);
    expect(viewerRes.status).toBe(200);
  });

  it("allows only admin to create records", async () => {
    const payload = {
      amount: 300,
      type: "EXPENSE",
      category: "Utilities",
      date: "2026-03-02T00:00:00.000Z",
      notes: "Power bill",
    };

    const [adminRes, analystRes, viewerRes] = await Promise.all([
      request(app)
        .post("/api/records")
        .set(authHeader(tokens.admin))
        .send(payload),
      request(app)
        .post("/api/records")
        .set(authHeader(tokens.analyst))
        .send(payload),
      request(app)
        .post("/api/records")
        .set(authHeader(tokens.viewer))
        .send(payload),
    ]);

    expect(adminRes.status).toBe(201);
    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);
  });

  it("allows only admin to update records", async () => {
    const payload = { notes: "Updated by RBAC test" };

    const [adminRes, analystRes, viewerRes] = await Promise.all([
      request(app)
        .patch(`/api/records/${targetRecordId}`)
        .set(authHeader(tokens.admin))
        .send(payload),
      request(app)
        .patch(`/api/records/${targetRecordId}`)
        .set(authHeader(tokens.analyst))
        .send(payload),
      request(app)
        .patch(`/api/records/${targetRecordId}`)
        .set(authHeader(tokens.viewer))
        .send(payload),
    ]);

    expect(adminRes.status).toBe(200);
    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);
  });

  it("allows only admin to delete records", async () => {
    const deleteCandidate = await prisma.financeRecord.create({
      data: {
        amount: 88,
        type: "EXPENSE",
        category: "Snacks",
        date: new Date("2026-03-03T00:00:00.000Z"),
        notes: "Delete candidate",
        createdById: (
          await prisma.user.findFirstOrThrow({
            where: { email: "rbac-admin@example.com" },
          })
        ).id,
      },
    });

    const [analystRes, viewerRes] = await Promise.all([
      request(app)
        .delete(`/api/records/${deleteCandidate.id}`)
        .set(authHeader(tokens.analyst)),
      request(app)
        .delete(`/api/records/${deleteCandidate.id}`)
        .set(authHeader(tokens.viewer)),
    ]);

    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);

    const adminRes = await request(app)
      .delete(`/api/records/${deleteCandidate.id}`)
      .set(authHeader(tokens.admin));
    expect(adminRes.status).toBe(204);
  });

  it("allows all roles to read dashboard summary", async () => {
    const [adminRes, analystRes, viewerRes] = await Promise.all([
      request(app).get("/api/dashboard/summary").set(authHeader(tokens.admin)),
      request(app)
        .get("/api/dashboard/summary")
        .set(authHeader(tokens.analyst)),
      request(app).get("/api/dashboard/summary").set(authHeader(tokens.viewer)),
    ]);

    expect(adminRes.status).toBe(200);
    expect(analystRes.status).toBe(200);
    expect(viewerRes.status).toBe(200);
  });

  it("allows only admin to list users", async () => {
    const [adminRes, analystRes, viewerRes] = await Promise.all([
      request(app).get("/api/users").set(authHeader(tokens.admin)),
      request(app).get("/api/users").set(authHeader(tokens.analyst)),
      request(app).get("/api/users").set(authHeader(tokens.viewer)),
    ]);

    expect(adminRes.status).toBe(200);
    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);
  });

  it("allows only admin to create users", async () => {
    const createPayload = {
      name: "Created From Admin",
      email: "created-from-admin@example.com",
      password: "Created123!",
      role: "VIEWER",
      status: "ACTIVE",
    };

    const [analystRes, viewerRes] = await Promise.all([
      request(app)
        .post("/api/users")
        .set(authHeader(tokens.analyst))
        .send(createPayload),
      request(app)
        .post("/api/users")
        .set(authHeader(tokens.viewer))
        .send(createPayload),
    ]);

    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);

    const adminPayload = {
      ...createPayload,
      email: "created-from-admin-2@example.com",
    };

    const adminRes = await request(app)
      .post("/api/users")
      .set(authHeader(tokens.admin))
      .send(adminPayload);
    expect(adminRes.status).toBe(201);
  });

  it("allows only admin to update user role", async () => {
    const payload = { role: "ANALYST" };

    const [analystRes, viewerRes] = await Promise.all([
      request(app)
        .patch(`/api/users/${targetUserId}/role`)
        .set(authHeader(tokens.analyst))
        .send(payload),
      request(app)
        .patch(`/api/users/${targetUserId}/role`)
        .set(authHeader(tokens.viewer))
        .send(payload),
    ]);

    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);

    const adminRes = await request(app)
      .patch(`/api/users/${targetUserId}/role`)
      .set(authHeader(tokens.admin))
      .send(payload);
    expect(adminRes.status).toBe(200);
  });

  it("allows only admin to update user status", async () => {
    const payload = { status: "ACTIVE" };

    const [analystRes, viewerRes] = await Promise.all([
      request(app)
        .patch(`/api/users/${targetUserId}/status`)
        .set(authHeader(tokens.analyst))
        .send(payload),
      request(app)
        .patch(`/api/users/${targetUserId}/status`)
        .set(authHeader(tokens.viewer))
        .send(payload),
    ]);

    expect(analystRes.status).toBe(403);
    expect(viewerRes.status).toBe(403);

    const adminRes = await request(app)
      .patch(`/api/users/${targetUserId}/status`)
      .set(authHeader(tokens.admin))
      .send(payload);
    expect(adminRes.status).toBe(200);
  });
});
