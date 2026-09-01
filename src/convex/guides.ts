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

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("guides").collect();
  },
});

export const listByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guides")
      .withIndex("by_type", (q) => q.eq("type", args.type as "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict"))
      .collect();
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    before: v.array(v.string()),
    during: v.array(v.string()),
    after: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const id = await ctx.db.insert("guides", {
      type: args.type as "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict",
      title: args.title,
      before: args.before,
      during: args.during,
      after: args.after,
    });
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "create_guide",
      resource: "guide",
      resourceId: id,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("guides"),
    title: v.optional(v.string()),
    before: v.optional(v.array(v.string())),
    during: v.optional(v.array(v.string())),
    after: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.before !== undefined) updates.before = args.before;
    if (args.during !== undefined) updates.during = args.during;
    if (args.after !== undefined) updates.after = args.after;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "update_guide",
      resource: "guide",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("guides") },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "delete_guide",
      resource: "guide",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});
