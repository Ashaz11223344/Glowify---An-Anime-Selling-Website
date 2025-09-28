import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createCustomOrder = mutation({
  args: {
    customerName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    frameSize: v.string(),
    frameType: v.string(),
    quantity: v.number(),
    customInstructions: v.string(),
    imageIds: v.array(v.id("_storage")),
    totalAmount: v.number(),
    orderMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const orderId = await ctx.db.insert("customOrders", {
      userId: userId || undefined,
      customerName: args.customerName,
      email: args.email,
      phone: args.phone,
      address: args.address,
      frameSize: args.frameSize,
      frameType: args.frameType,
      quantity: args.quantity,
      customInstructions: args.customInstructions,
      imageIds: args.imageIds,
      totalAmount: args.totalAmount,
      status: "pending",
      orderMethod: args.orderMethod,
    });

    // Schedule deletion of images after 24 hours for privacy
    await ctx.scheduler.runAfter(
      24 * 60 * 60 * 1000, // 24 hours in milliseconds
      api.customOrders.deleteImages,
      { imageIds: args.imageIds }
    );

    return orderId;
  },
});

export const deleteImages = action({
  args: { imageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    // Delete images from storage for privacy
    for (const imageId of args.imageIds) {
      try {
        await ctx.storage.delete(imageId);
      } catch (error) {
        console.error(`Failed to delete image ${imageId}:`, error);
      }
    }
  },
});



export const getUserCustomOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("customOrders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      orders.map(async (order) => ({
        ...order,
        imageUrls: await Promise.all(
          order.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url;
          })
        ),
      }))
    );
  },
});

export const getAllCustomOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) {
      throw new Error("Not authorized");
    }

    const orders = await ctx.db
      .query("customOrders")
      .order("desc")
      .collect();

    return Promise.all(
      orders.map(async (order) => ({
        ...order,
        imageUrls: await Promise.all(
          order.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url;
          })
        ),
      }))
    );
  },
});

export const updateCustomOrderStatus = mutation({
  args: {
    orderId: v.id("customOrders"),
    status: v.string(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      adminNotes: args.adminNotes,
    });
  },
});
