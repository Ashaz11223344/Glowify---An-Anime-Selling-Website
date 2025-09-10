import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserDisplayName = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user profile first
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Get user auth data
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      name: profile?.name || null,
      email: user.email || null,
      displayName: profile?.name || user.email || "User",
    };
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    birthdate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        birthdate: args.birthdate,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        name: args.name,
        birthdate: args.birthdate,
      });
    }
  },
});

export const updateDefaultAddress = mutation({
  args: {
    type: v.union(v.literal("Home"), v.literal("Office"), v.literal("Other")),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const defaultAddress = {
      type: args.type,
      address: args.address,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        defaultAddress,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        defaultAddress,
      });
    }
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { liveOrders: [], completedOrders: [], allOrders: [] };
    }

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const liveOrders = allOrders.filter(order => 
      order.status === "pending" || order.status === "confirmed"
    );

    const completedOrders = allOrders.filter(order => 
      order.status === "completed"
    );

    return {
      liveOrders,
      completedOrders,
      allOrders,
    };
  },
});

export const canDeleteAccount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const liveOrders = await ctx.db
      .query("orders")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "pending"))
      .collect();

    const confirmedOrders = await ctx.db
      .query("orders")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "confirmed"))
      .collect();

    return liveOrders.length === 0 && confirmedOrders.length === 0;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user has live orders
    const liveOrders = await ctx.db
      .query("orders")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "pending"))
      .collect();

    const confirmedOrders = await ctx.db
      .query("orders")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "confirmed"))
      .collect();

    if (liveOrders.length > 0 || confirmedOrders.length > 0) {
      throw new Error("Cannot delete account with active orders");
    }

    // Delete user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Delete cart items
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Delete reviews
    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // Delete admin status
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (adminUser) {
      await ctx.db.delete(adminUser._id);
    }

    // Delete completed orders
    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "completed"))
      .collect();
    for (const order of completedOrders) {
      await ctx.db.delete(order._id);
    }

    // Finally delete the user account
    await ctx.db.delete(userId);
  },
});
