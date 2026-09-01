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
    return await ctx.db.query("helplines").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const id = await ctx.db.insert("helplines", args);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "create_helpline",
      resource: "helpline",
      resourceId: id,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("helplines"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.description !== undefined) updates.description = args.description;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "update_helpline",
      resource: "helpline",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("helplines") },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "delete_helpline",
      resource: "helpline",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});
