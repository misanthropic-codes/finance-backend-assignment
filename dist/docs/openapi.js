"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiSpec = void 0;
exports.openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Finance Backend API",
        version: "1.0.0",
        description: "Finance data processing and RBAC backend API documentation.",
    },
    servers: [
        {
            url: process.env.PUBLIC_API_URL ?? "http://localhost:4000",
            description: "Current environment",
        },
    ],
    tags: [
        { name: "Health" },
        { name: "Auth" },
        { name: "Users" },
        { name: "Records" },
        { name: "Dashboard" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                },
                required: ["message"],
            },
            LoginRequest: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                },
                required: ["email", "password"],
            },
            Role: {
                type: "string",
                enum: ["VIEWER", "ANALYST", "ADMIN"],
            },
            UserStatus: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE"],
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    role: { $ref: "#/components/schemas/Role" },
                    status: { $ref: "#/components/schemas/UserStatus" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
                required: ["id", "name", "email", "role", "status"],
            },
            LoginResponse: {
                type: "object",
                properties: {
                    token: { type: "string" },
                    user: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string", format: "email" },
                            role: { $ref: "#/components/schemas/Role" },
                            status: { $ref: "#/components/schemas/UserStatus" },
                        },
                        required: ["id", "name", "email", "role", "status"],
                    },
                },
                required: ["token", "user"],
            },
            CreateUserRequest: {
                type: "object",
                properties: {
                    name: { type: "string", minLength: 2 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    role: { $ref: "#/components/schemas/Role" },
                    status: { $ref: "#/components/schemas/UserStatus" },
                },
                required: ["name", "email", "password"],
            },
            UserListResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                    },
                },
                required: ["data"],
            },
            RecordType: {
                type: "string",
                enum: ["INCOME", "EXPENSE"],
            },
            Record: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    amount: { type: "number" },
                    type: { $ref: "#/components/schemas/RecordType" },
                    category: { type: "string" },
                    date: { type: "string", format: "date-time" },
                    notes: { type: "string", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    createdById: { type: "string" },
                    createdBy: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string", format: "email" },
                        },
                    },
                },
                required: ["id", "amount", "type", "category", "date", "createdById"],
            },
            CreateRecordRequest: {
                type: "object",
                properties: {
                    amount: { type: "number", exclusiveMinimum: 0 },
                    type: { $ref: "#/components/schemas/RecordType" },
                    category: { type: "string", minLength: 2 },
                    date: { type: "string", format: "date-time" },
                    notes: { type: "string", maxLength: 500 },
                },
                required: ["amount", "type", "category", "date"],
            },
            UpdateRecordRequest: {
                type: "object",
                properties: {
                    amount: { type: "number", exclusiveMinimum: 0 },
                    type: { $ref: "#/components/schemas/RecordType" },
                    category: { type: "string", minLength: 2 },
                    date: { type: "string", format: "date-time" },
                    notes: { type: "string", maxLength: 500, nullable: true },
                },
            },
            RecordListResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Record" },
                    },
                    pagination: {
                        type: "object",
                        properties: {
                            page: { type: "integer" },
                            pageSize: { type: "integer" },
                            total: { type: "integer" },
                            totalPages: { type: "integer" },
                        },
                        required: ["page", "pageSize", "total", "totalPages"],
                    },
                },
                required: ["data", "pagination"],
            },
            DashboardSummaryResponse: {
                type: "object",
                properties: {
                    totals: {
                        type: "object",
                        properties: {
                            income: { type: "number" },
                            expenses: { type: "number" },
                            netBalance: { type: "number" },
                        },
                        required: ["income", "expenses", "netBalance"],
                    },
                    categoryTotals: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: { type: "string" },
                                amount: { type: "number" },
                            },
                            required: ["category", "amount"],
                        },
                    },
                    monthlyTrends: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                month: { type: "string", example: "2026-04" },
                                income: { type: "number" },
                                expense: { type: "number" },
                                net: { type: "number" },
                            },
                            required: ["month", "income", "expense", "net"],
                        },
                    },
                    recentActivity: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Record" },
                    },
                },
                required: ["totals", "categoryTotals", "monthlyTrends", "recentActivity"],
            },
        },
    },
    paths: {
        "/api/health": {
            get: {
                tags: ["Health"],
                summary: "Health check",
                responses: {
                    "200": {
                        description: "API is healthy",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "ok" },
                                    },
                                    required: ["status"],
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login and get JWT",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Authenticated successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid credentials",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "403": {
                        description: "Inactive user",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/api/users": {
            get: {
                tags: ["Users"],
                summary: "List users",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Users fetched",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UserListResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Users"],
                summary: "Create a user",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateUserRequest" },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/User" },
                                    },
                                    required: ["data"],
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Email already in use",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/api/users/{userId}/role": {
            patch: {
                tags: ["Users"],
                summary: "Update user role",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    role: { $ref: "#/components/schemas/Role" },
                                },
                                required: ["role"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Role updated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/User" },
                                    },
                                    required: ["data"],
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/users/{userId}/status": {
            patch: {
                tags: ["Users"],
                summary: "Update user status",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { $ref: "#/components/schemas/UserStatus" },
                                },
                                required: ["status"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Status updated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/User" },
                                    },
                                    required: ["data"],
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/records": {
            get: {
                tags: ["Records"],
                summary: "List financial records",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "type",
                        in: "query",
                        schema: { $ref: "#/components/schemas/RecordType" },
                    },
                    {
                        name: "category",
                        in: "query",
                        schema: { type: "string" },
                    },
                    {
                        name: "startDate",
                        in: "query",
                        schema: { type: "string", format: "date-time" },
                    },
                    {
                        name: "endDate",
                        in: "query",
                        schema: { type: "string", format: "date-time" },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", default: 20, maximum: 100 },
                    },
                ],
                responses: {
                    "200": {
                        description: "Records fetched",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RecordListResponse" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Records"],
                summary: "Create a financial record",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateRecordRequest" },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Record created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Record" },
                                    },
                                    required: ["data"],
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/records/{recordId}": {
            patch: {
                tags: ["Records"],
                summary: "Update a financial record",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "recordId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UpdateRecordRequest" },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Record updated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: { $ref: "#/components/schemas/Record" },
                                    },
                                    required: ["data"],
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Records"],
                summary: "Delete a financial record",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "recordId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "204": {
                        description: "Record deleted",
                    },
                },
            },
        },
        "/api/dashboard/summary": {
            get: {
                tags: ["Dashboard"],
                summary: "Get dashboard summary",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Dashboard summary fetched",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/DashboardSummaryResponse" },
                            },
                        },
                    },
                },
            },
        },
    },
};
