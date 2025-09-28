import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        const imageUrls = await Promise.all(
          product.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url;
          })
        );

        return {
          ...item,
          product: {
            ...product,
            imageUrls: imageUrls.filter(Boolean),
          },
        };
      })
    );

    return itemsWithProducts.filter(Boolean);
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cart", {
        userId,
        productId: args.productId,
        quantity: args.quantity,
      });
    }
  },
});

export const updateQuantity = mutation({
  args: {
    itemId: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.itemId);
    } else {
      await ctx.db.patch(args.itemId, { quantity: args.quantity });
    }
  },
});

export const remove = mutation({
  args: { itemId: v.id("cart") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.itemId);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
});
