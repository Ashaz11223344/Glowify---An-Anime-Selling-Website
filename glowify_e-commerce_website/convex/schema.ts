import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    animeName: v.string(),
    imageIds: v.array(v.id("_storage")),
    isActive: v.boolean(),
    totalSales: v.number(),
    averageRating: v.number(),
    reviewCount: v.number(),
  })
    .index("by_anime", ["animeName"])
    .index("by_price", ["price"])
    .index("by_popularity", ["totalSales"])
    .index("by_rating", ["averageRating"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["animeName", "isActive"],
    }),

  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    userName: v.string(),
  }).index("by_product", ["productId"]),

  cart: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    productId: v.id("products"),
    productName: v.string(),
    quantity: v.number(),
    originalAmount: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    totalAmount: v.number(),
    couponCode: v.optional(v.string()),
    status: v.string(), // "pending", "confirmed", "completed"
    orderMethod: v.optional(v.string()), // "whatsapp", "email"
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    isAdmin: v.boolean(),
  }).index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    birthdate: v.optional(v.string()),
    defaultAddress: v.optional(v.object({
      type: v.union(v.literal("Home"), v.literal("Office"), v.literal("Other")),
      address: v.string(),
    })),
  }).index("by_user", ["userId"]),

  coupons: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    isActive: v.boolean(),
    validFrom: v.number(),
    validUntil: v.number(),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
    description: v.optional(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_active", ["isActive"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
