import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return adminUser?.isAdmin || false;
  },
});

export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Check if already admin
    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingAdmin) {
      await ctx.db.patch(existingAdmin._id, { isAdmin: true });
    } else {
      await ctx.db.insert("adminUsers", {
        userId: user._id,
        isAdmin: true,
      });
    }
  },
});

// Temporary function to setup first admin - remove after use
export const setupFirstAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingAdmin) {
      await ctx.db.patch(existingAdmin._id, { isAdmin: true });
    } else {
      await ctx.db.insert("adminUsers", {
        userId: user._id,
        isAdmin: true,
      });
    }
    
    return "Admin setup complete!";
  },
});
