import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    return reviews.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Add review
    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId,
      rating: args.rating,
      comment: args.comment,
      userName: user.name || user.email || "Anonymous",
    });

    // Update product rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + args.rating;
    const reviewCount = reviews.length + 1;
    const averageRating = totalRating / reviewCount;

    await ctx.db.patch(args.productId, {
      averageRating,
      reviewCount,
    });
  },
});
