import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ── Roles ─────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// ── Shared validators ──────────────────────────────────────
const disasterTypeValidator = v.union(
  v.literal("Flood"),
  v.literal("Earthquake"),
  v.literal("Cyclone"),
  v.literal("Wildfire"),
  v.literal("Landslide"),
  v.literal("Conflict"),
);

const severityValidator = v.union(
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("Critical"),
);

const zoneStatusValidator = v.union(
  v.literal("Available"),
  v.literal("Limited"),
  v.literal("Full"),
  v.literal("Closed"),
);

const alertStatusValidator = v.union(
  v.literal("active"),
  v.literal("expired"),
  v.literal("archived"),
  v.literal("demo"),
);

const dataModeValidator = v.union(
  v.literal("live"),
  v.literal("demo"),
);

const reportStatusValidator = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("rejected"),
  v.literal("resolved"),
);

const schema = defineSchema(
  {
    // ── Auth tables (do not modify) ──────────────────────
    ...authTables,

    // ── Users ────────────────────────────────────────────
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      username: v.optional(v.string()),
      phone: v.optional(v.string()),
      preferredLanguage: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("username", ["username"])
      .index("role", ["role"]),

    // ── Alerts ───────────────────────────────────────────
    alerts: defineTable({
      type: disasterTypeValidator,
      severity: severityValidator,
      title: v.string(),
      description: v.string(),
      location: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      radius: v.optional(v.number()),
      source: v.string(),
      sourceUrl: v.optional(v.string()),
      sourceId: v.optional(v.string()),
      issuedAt: v.number(),
      updatedAt: v.number(),
      expiresAt: v.optional(v.number()),
      status: alertStatusValidator,
      mode: dataModeValidator,
      verified: v.boolean(),
    })
      .index("by_type", ["type"])
      .index("by_status", ["status"])
      .index("by_mode", ["mode"])
      .index("by_severity", ["severity"])
      .index("by_source", ["source"])
      .index("by_issuedAt", ["issuedAt"]),

    // ── Danger Zones ─────────────────────────────────────
    dangerZones: defineTable({
      type: disasterTypeValidator,
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
      severity: severityValidator,
      source: v.string(),
      active: v.boolean(),
      mode: dataModeValidator,
      issuedAt: v.number(),
      updatedAt: v.number(),
      expiresAt: v.optional(v.number()),
    })
      .index("by_type", ["type"])
      .index("by_active", ["active"])
      .index("by_mode", ["mode"]),

    // ── Safe Zones ───────────────────────────────────────
    safeZones: defineTable({
      name: v.string(),
      type: v.string(),
      location: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      capacity: v.number(),
      availableCapacity: v.optional(v.number()),
      disasterTypes: v.array(disasterTypeValidator),
      status: zoneStatusValidator,
      verified: v.boolean(),
      source: v.optional(v.string()),
      mode: dataModeValidator,
    })
      .index("by_status", ["status"])
      .index("by_mode", ["mode"])
      .index("by_verified", ["verified"]),

    // ── Facilities ───────────────────────────────────────
    facilities: defineTable({
      type: v.union(
        v.literal("Hospital"),
        v.literal("Police"),
        v.literal("Fire Station"),
        v.literal("Shelter"),
        v.literal("Other"),
      ),
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      phone: v.optional(v.string()),
      source: v.string(),
      mode: dataModeValidator,
    })
      .index("by_type", ["type"])
      .index("by_mode", ["mode"]),

    // ── User Reports ─────────────────────────────────────
    userReports: defineTable({
      userId: v.optional(v.string()),
      userName: v.optional(v.string()),
      type: v.union(
        v.literal("Flooded Road"),
        v.literal("Blocked Road"),
        v.literal("Fire"),
        v.literal("Damaged Building"),
        v.literal("Unsafe Area"),
        v.literal("Missing Person"),
        v.literal("Other"),
      ),
      description: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      status: reportStatusValidator,
      verifiedBy: v.optional(v.string()),
      verifiedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_userId", ["userId"]),

    // ── Guides ───────────────────────────────────────────
    guides: defineTable({
      type: disasterTypeValidator,
      title: v.string(),
      before: v.array(v.string()),
      during: v.array(v.string()),
      after: v.array(v.string()),
    })
      .index("by_type", ["type"]),

    // ── Helplines ────────────────────────────────────────
    helplines: defineTable({
      name: v.string(),
      phone: v.string(),
      description: v.optional(v.string()),
    }),

    // ── Audit Logs ───────────────────────────────────────
    auditLogs: defineTable({
      actor: v.string(),
      action: v.string(),
      resource: v.string(),
      resourceId: v.optional(v.string()),
      metadata: v.optional(v.string()),
      timestamp: v.number(),
    })
      .index("by_actor", ["actor"])
      .index("by_timestamp", ["timestamp"]),

    // ── Demo Scenarios ───────────────────────────────────
    demoScenarios: defineTable({
      name: v.string(),
      type: disasterTypeValidator,
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
      severity: severityValidator,
      active: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_active", ["active"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
