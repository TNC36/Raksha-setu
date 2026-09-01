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

/** List all reports (admin) or pending reports (public) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user?.role === "admin") {
      return await ctx.db.query("userReports").order("desc").collect();
    }
    return await ctx.db
      .query("userReports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

/** Submit a user report (any authenticated user) */
export const submit = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;

    return await ctx.db.insert("userReports", {
      userId: userId || undefined,
      userName: user?.name || "Anonymous",
      type: args.type,
      description: args.description,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/** Admin: verify/reject/resolve report */
export const updateStatus = mutation({
  args: {
    id: v.id("userReports"),
    status: v.union(
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("resolved"),
    ),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      status: args.status,
      verifiedBy: adminId,
      verifiedAt: Date.now(),
    });
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: `report_${args.status}`,
      resource: "userReport",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});

/** Report stats for admin dashboard */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("userReports").collect();
    return {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      verified: all.filter((r) => r.status === "verified").length,
      rejected: all.filter((r) => r.status === "rejected").length,
      resolved: all.filter((r) => r.status === "resolved").length,
    };
  },
});
