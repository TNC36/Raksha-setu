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
    return await ctx.db.query("safeZones").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("safeZones").collect();
    return all.filter((z) => z.status !== "Closed");
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    capacity: v.number(),
    disasterTypes: v.array(v.string()),
    status: v.string(),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const id = await ctx.db.insert("safeZones", {
      ...args,
      disasterTypes: args.disasterTypes as ("Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict")[],
      status: args.status as "Available" | "Limited" | "Full" | "Closed",
      mode: "demo",
    });
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "create_safe_zone",
      resource: "safeZone",
      resourceId: id,
      metadata: JSON.stringify({ name: args.name }),
      timestamp: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("safeZones"),
    name: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.capacity !== undefined) updates.capacity = args.capacity;
    if (args.status !== undefined) updates.status = args.status;
    if (args.verified !== undefined) updates.verified = args.verified;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "update_safe_zone",
      resource: "safeZone",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("safeZones") },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      actor: adminId,
      action: "delete_safe_zone",
      resource: "safeZone",
      resourceId: args.id,
      timestamp: Date.now(),
    });
  },
});
