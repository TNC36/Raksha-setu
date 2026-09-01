import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if the current user is an admin.
 * This is the ONLY way to verify admin status — never trust the client.
 */
async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return userId;
}

/**
 * Check if the current user is an admin (returns boolean, doesn't throw).
 */
async function isAdmin(ctx: QueryCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

// ── Queries ────────────────────────────────────────────────

/** Check if current user is admin (safe, non-throwing) */
export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

/** Get current user with role */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      preferredLanguage: user.preferredLanguage,
    };
  },
});

// ── Mutations ──────────────────────────────────────────────

/** Set user role (admin only) */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role });

    await ctx.db.insert("auditLogs", {
      actor: (await requireAdmin(ctx)),
      action: "set_role",
      resource: "user",
      resourceId: args.userId,
      metadata: JSON.stringify({ role: args.role }),
      timestamp: Date.now(),
    });
  },
});

/** Update user profile (own profile only) */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.preferredLanguage !== undefined) updates.preferredLanguage = args.preferredLanguage;

    await ctx.db.patch(userId, updates);
  },
});


