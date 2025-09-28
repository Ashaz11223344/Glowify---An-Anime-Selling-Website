import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    animeName: v.optional(v.string()),
    sortBy: v.optional(v.string()), // "price_asc", "price_desc", "popularity", "rating"
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("products");
    
    // For admin, include inactive products
    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    if (args.search) {
      const searchResults = await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) => {
          let searchQuery = q.search("name", args.search!);
          if (!args.includeInactive) {
            searchQuery = searchQuery.eq("isActive", true);
          }
          return searchQuery;
        })
        .collect();
      
      // Get image URLs for search results
      const productsWithImages = await Promise.all(
        searchResults.map(async (product) => {
          const imageUrls = await Promise.all(
            product.imageIds.map(async (imageId) => {
              const url = await ctx.storage.getUrl(imageId);
              return url;
            })
          );
          return {
            ...product,
            imageUrls: imageUrls.filter(Boolean),
          };
        })
      );
      return productsWithImages;
    }

    if (args.animeName) {
      query = query.filter((q) => q.eq(q.field("animeName"), args.animeName));
    }

    let products = await query.collect();

    // Sort products
    if (args.sortBy === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (args.sortBy === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (args.sortBy === "popularity") {
      products.sort((a, b) => b.totalSales - a.totalSales);
    } else if (args.sortBy === "rating") {
      products.sort((a, b) => b.averageRating - a.averageRating);
    }

    // Get image URLs
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imageUrls = await Promise.all(
          product.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url;
          })
        );
        return {
          ...product,
          imageUrls: imageUrls.filter(Boolean),
        };
      })
    );

    return productsWithImages;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const imageUrls = await Promise.all(
      product.imageIds.map(async (imageId) => {
        const url = await ctx.storage.getUrl(imageId);
        return url;
      })
    );

    return {
      ...product,
      imageUrls: imageUrls.filter(Boolean),
    };
  },
});

export const getTopSelling = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const topProducts = products
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 8);

    const productsWithImages = await Promise.all(
      topProducts.map(async (product) => {
        const imageUrls = await Promise.all(
          product.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url;
          })
        );
        return {
          ...product,
          imageUrls: imageUrls.filter(Boolean),
        };
      })
    );

    return productsWithImages;
  },
});

export const getAnimeNames = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const animeNames = [...new Set(products.map((p) => p.animeName))];
    return animeNames.sort();
  },
});

// Admin functions
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    animeName: v.string(),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) throw new Error("Not authorized");

    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      totalSales: 0,
      averageRating: 0,
      reviewCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    animeName: v.string(),
    imageIds: v.array(v.id("_storage")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) throw new Error("Not authorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const toggleStatus = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) throw new Error("Not authorized");

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(args.id, { isActive: !product.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!adminUser?.isAdmin) throw new Error("Not authorized");

    return await ctx.storage.generateUploadUrl();
  },
});
