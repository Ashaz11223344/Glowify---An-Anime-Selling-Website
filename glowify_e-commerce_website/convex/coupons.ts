import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    validFrom: v.number(),
    validUntil: v.number(),
    usageLimit: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) {
      throw new Error("Not authorized");
    }

    // Check if coupon code already exists
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (existingCoupon) {
      throw new Error("Coupon code already exists");
    }

    return await ctx.db.insert("coupons", {
      code: args.code.toUpperCase(),
      discountType: args.discountType,
      discountValue: args.discountValue,
      isActive: true,
      validFrom: args.validFrom,
      validUntil: args.validUntil,
      usageLimit: args.usageLimit,
      usedCount: 0,
      description: args.description,
    });
  },
});

export const listCoupons = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) {
      throw new Error("Not authorized");
    }

    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const toggleCouponStatus = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) {
      throw new Error("Not authorized");
    }

    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    await ctx.db.patch(args.couponId, {
      isActive: !coupon.isActive,
    });
  },
});

export const validateCoupon = query({
  args: {
    code: v.string(),
    orderAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "Coupon is not active" };
    }

    const now = Date.now();
    if (now < coupon.validFrom) {
      return { valid: false, error: "Coupon is not yet valid" };
    }

    if (now > coupon.validUntil) {
      return { valid: false, error: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (args.orderAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, args.orderAmount);
    }

    const finalAmount = Math.max(0, args.orderAmount - discountAmount);

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
    };
  },
});

export const applyCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    await ctx.db.patch(args.couponId, {
      usedCount: coupon.usedCount + 1,
    });
  },
});
