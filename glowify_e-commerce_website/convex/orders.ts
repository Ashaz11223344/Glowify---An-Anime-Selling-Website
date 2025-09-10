import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const createOrder = mutation({
  args: {
    customerName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    couponCode: v.optional(v.string()),
    orderMethod: v.union(v.literal("whatsapp"), v.literal("email")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < args.quantity) {
      throw new Error("Insufficient stock");
    }

    const originalAmount = product.price * args.quantity;
    let discountAmount = 0;
    let finalAmount = originalAmount;

    // Apply coupon if provided
    if (args.couponCode) {
      const couponValidation = await ctx.runQuery(api.coupons.validateCoupon, {
        code: args.couponCode,
        orderAmount: originalAmount,
      });

      if (!couponValidation.valid) {
        throw new Error(couponValidation.error || "Invalid coupon");
      }

      discountAmount = couponValidation.discountAmount || 0;
      finalAmount = couponValidation.finalAmount || originalAmount;

      // Mark coupon as used
      if (couponValidation.coupon) {
        await ctx.runMutation(api.coupons.applyCoupon, {
          couponId: couponValidation.coupon._id,
        });
      }
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId: userId || undefined,
      customerName: args.customerName,
      email: args.email,
      phone: args.phone,
      address: args.address,
      productId: args.productId,
      productName: product.name,
      quantity: args.quantity,
      originalAmount,
      discountAmount,
      totalAmount: finalAmount,
      couponCode: args.couponCode,
      status: "pending",
      orderMethod: args.orderMethod,
    });

    // Update product stock and sales
    await ctx.db.patch(args.productId, {
      stock: product.stock - args.quantity,
      totalSales: product.totalSales + args.quantity,
    });

    return orderId;
  },
});

export const sendOrderEmail = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ mailtoUrl: string; emailSubject: string; emailBody: string }> => {
    const order = await ctx.runQuery(api.orders.getOrderById, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const product = await ctx.runQuery(api.products.getById, {
      id: order.productId,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const emailSubject: string = `New Order Request - ${product.name}`;
    const emailBody: string = `
Order Details:
--------------
Order ID: ${order._id}
Product: ${product.name}
Quantity: ${order.quantity}
Original Amount: ₹${order.originalAmount}
${(order.discountAmount || 0) > 0 ? `Discount: -₹${order.discountAmount} (${order.couponCode})` : ''}
Total Amount: ₹${order.totalAmount}

Customer Details:
-----------------
Name: ${order.customerName}
Email: ${order.email}
Phone: ${order.phone}
Address: ${order.address}

Please process this order request.

Best regards,
Glowify Team
    `.trim();

    // Create mailto URLs for both emails
    const email1 = "ashazpathan8@gmail.com";
    const email2 = "aryashejwal900@gmail.com";
    
    const mailtoUrl: string = `mailto:${email1},${email2}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    return { mailtoUrl, emailSubject, emailBody };
  },
});

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getAllOrders = query({
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

    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
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

    await ctx.db.patch(args.orderId, {
      status: args.status,
    });
  },
});
