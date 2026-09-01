import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Authentication required");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Admin access required");
  return userId;
}

// ── Queries ────────────────────────────────────────────────

/** Get all active alerts (public) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();
  },
});

/** Get alerts by disaster type (public) */
export const listByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_type", (q) => q.eq("type", args.type as "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict"))
      .order("desc")
      .collect();
  },
});

/** Get all alerts for admin (includes expired/demo) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("alerts").order("desc").collect();
  },
});

/** Get alert stats for dashboard */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("alerts").collect();
    const active = all.filter((a) => a.status === "active");
    const critical = active.filter((a) => a.severity === "Critical");
    const high = active.filter((a) => a.severity === "High");
    const live = active.filter((a) => a.mode === "live");
    const demo = active.filter((a) => a.mode === "demo");
    return {
      total: all.length,
      active: active.length,
      critical: critical.length,
      high: high.length,
      live: live.length,
      demo: demo.length,
    };
  },
});

// ── Mutations ──────────────────────────────────────────────

/** Create alert (admin only) */
export const create = mutation({
  args: {
    type: v.string(),
    severity: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    mode: v.union(v.literal("live"), v.literal("demo")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const now = Date.now();

    const id = await ctx.db.insert("alerts", {
      type: args.type as "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict",
      severity: args.severity as "Low" | "Medium" | "High" | "Critical",
      title: args.title,
      description: args.description,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
      radius: args.radius,
      source: args.source,
      sourceUrl: args.sourceUrl,
      sourceId: undefined,
      issuedAt: now,
      updatedAt: now,
      expiresAt: args.expiresAt,
      status: "active" as const,
      mode: args.mode,
      verified: args.mode === "live",
    });

    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "create_alert",
      resource: "alert",
      resourceId: id,
      metadata: JSON.stringify({ title: args.title, type: args.type }),
      timestamp: now,
    });

    return id;
  },
});

/** Update alert (admin only) */
export const update = mutation({
  args: {
    id: v.id("alerts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const now = Date.now();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (args.title) updates.title = args.title;
    if (args.description) updates.description = args.description;
    if (args.severity) updates.severity = args.severity;
    if (args.status) updates.status = args.status;

    await ctx.db.patch(args.id, updates);

    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "update_alert",
      resource: "alert",
      resourceId: args.id,
      timestamp: now,
    });
  },
});

/** Delete alert (admin only) */
export const remove = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "delete_alert",
      resource: "alert",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});

/** Bulk expire old alerts (admin or system) */
export const expireOld = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("alerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let count = 0;
    for (const alert of expired) {
      if (alert.expiresAt && alert.expiresAt < now) {
        await ctx.db.patch(alert._id, { status: "expired" });
        count++;
      }
    }
    return count;
  },
});
