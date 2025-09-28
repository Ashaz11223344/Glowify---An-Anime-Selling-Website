import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, MessageCircle, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { CouponInput } from "./CouponInput";
import { OrderMethodModal } from "./OrderMethodModal";

interface CartProps {
  onBack: () => void;
}

export function Cart({ onBack }: CartProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  const cartItems = useQuery(api.cart.list) || [];
  const removeFromCart = useMutation(api.cart.remove);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const clearCart = useMutation(api.cart.clear);
  const createOrder = useMutation(api.orders.create);

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart({ productId: productId as any });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await updateQuantity({ productId: productId as any, quantity });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleNormalOrder = (orderMethod: "whatsapp" | "email", customerData: any, couponData?: any) => {
    const orderInfo = {
      items: cartItems,
      customerData,
      subtotal: calculateSubtotal(),
      discount: couponData?.discountAmount || 0,
      total: calculateSubtotal() - (couponData?.discountAmount || 0),
      couponCode: couponData?.couponCode,
      orderMethod
    };

    if (orderMethod === "whatsapp") {
      sendWhatsAppOrder(orderInfo);
    } else {
      sendEmailOrder(orderInfo);
    }
  };

  const handleCustomOrder = (orderMethod: "whatsapp" | "email", customerData: any) => {
    const orderInfo = {
      items: cartItems,
      customerData,
      subtotal: calculateSubtotal(),
      total: calculateSubtotal(),
      orderMethod,
      isCustom: true
    };

    if (orderMethod === "whatsapp") {
      sendWhatsAppOrder(orderInfo);
    } else {
      sendEmailOrder(orderInfo);
    }
  };

  const sendWhatsAppOrder = (orderInfo: any) => {
    const { items, customerData, subtotal, discount, total, couponCode, isCustom } = orderInfo;
    
    let message = `🛒 *NEW ORDER FROM GLOWIFY*\n\n`;
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${customerData.name}\n`;
    message += `Email: ${customerData.email}\n`;
    message += `Phone: ${customerData.phone}\n`;
    message += `Address: ${customerData.address}\n\n`;
    
    message += `📦 *Order Items:*\n`;
    items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${item.price} each\n`;
      message += `   Subtotal: ₹${item.price * item.quantity}\n\n`;
    });
    
    message += `💰 *Order Summary:*\n`;
    message += `Subtotal: ₹${subtotal}\n`;
    
    if (discount > 0) {
      message += `Discount (${couponCode}): -₹${discount}\n`;
    }
    
    message += `*Total: ₹${total}*\n\n`;
    
    if (isCustom) {
      message += `📝 *Special Request:* Customer wants to discuss custom modifications or pricing\n\n`;
    }
    
    message += `⏰ Order Time: ${new Date().toLocaleString()}\n`;
    message += `🌐 Order Source: Glowify Website`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918308553555?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("WhatsApp opened with order details!");
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
      onBack();
    }, 2000);
  };

  const sendEmailOrder = (orderInfo: any) => {
    const { items, customerData, subtotal, discount, total, couponCode, isCustom } = orderInfo;
    
    const subject = `New Order from Glowify - ${customerData.name}`;
    
    let body = `Dear Glowify Team,\n\n`;
    body += `I would like to place the following order:\n\n`;
    
    body += `CUSTOMER DETAILS:\n`;
    body += `Name: ${customerData.name}\n`;
    body += `Email: ${customerData.email}\n`;
    body += `Phone: ${customerData.phone}\n`;
    body += `Address: ${customerData.address}\n\n`;
    
    body += `ORDER ITEMS:\n`;
    items.forEach((item: any, index: number) => {
      body += `${index + 1}. ${item.name}\n`;
      body += `   Quantity: ${item.quantity}\n`;
      body += `   Price: ₹${item.price} each\n`;
      body += `   Subtotal: ₹${item.price * item.quantity}\n\n`;
    });
    
    body += `ORDER SUMMARY:\n`;
    body += `Subtotal: ₹${subtotal}\n`;
    
    if (discount > 0) {
      body += `Discount (${couponCode}): -₹${discount}\n`;
    }
    
    body += `Total: ₹${total}\n\n`;
    
    if (isCustom) {
      body += `SPECIAL REQUEST: I would like to discuss custom modifications or pricing for this order.\n\n`;
    }
    
    body += `Order Time: ${new Date().toLocaleString()}\n`;
    body += `Order Source: Glowify Website\n\n`;
    body += `Please confirm this order and let me know the next steps.\n\n`;
    body += `Thank you!\n`;
    body += `${customerData.name}`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const emailUrl = `mailto:ashazpathan8@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;
    
    window.open(emailUrl, '_blank');
    toast.success("Email client opened with order details!");
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
      onBack();
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Shopping Cart
            </h1>
          </div>
        </div>

        <div className="glass rounded-xl p-12 text-center">
          <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some amazing anime posters to get started!
          </p>
          <button
            onClick={onBack}
            className="bg-gradient-primary hover:glow-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="glass rounded-xl p-6">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrls && item.imageUrls[0] ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.animeName}</p>
                  <p className="text-lg font-bold text-primary">₹{item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-md bg-background hover:bg-primary/20 flex items-center justify-center transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-md bg-background hover:bg-primary/20 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="w-8 h-8 rounded-md bg-destructive/20 hover:bg-destructive/30 text-destructive flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {item.quantity} × ₹{item.price}
                </span>
                <span className="font-semibold text-lg">₹{item.price * item.quantity}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Coupon Input */}
          <CouponInput />

          {/* Order Summary Card */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{calculateSubtotal()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{calculateSubtotal()}</span>
                </div>
              </div>
            </div>

            {/* Order Options */}
            <div className="space-y-3">
              {/* Normal Order */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full bg-gradient-primary hover:glow-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Place Order
              </button>

              {/* Custom Order */}
              <button
                onClick={() => setShowCustomOrderModal(true)}
                className="w-full border-2 border-primary/50 hover:border-primary text-primary hover:bg-primary/10 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Request Custom Quote
              </button>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <button
                  onClick={() => {
                    const message = `Hi! I'm interested in ordering from Glowify. Can you help me with my cart items?`;
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/918308553555?text=${encodedMessage}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const subject = encodeURIComponent("Inquiry about Glowify Products");
                    const body = encodeURIComponent("Hi,\n\nI'm interested in ordering from Glowify. Can you help me with my cart items?\n\nThank you!");
                    window.open(`mailto:ashazpathan8@gmail.com?subject=${subject}&body=${body}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Clear Cart */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your cart?")) {
                clearCart();
                toast.success("Cart cleared");
              }
            }}
            className="w-full text-destructive hover:bg-destructive/10 py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Order Method Modals */}
      {showOrderModal && (
        <OrderMethodModal
          onClose={() => setShowOrderModal(false)}
          onSubmit={handleNormalOrder}
          title="Place Your Order"
          description="Choose how you'd like to send your order details:"
        />
      )}

      {showCustomOrderModal && (
        <OrderMethodModal
          onClose={() => setShowCustomOrderModal(false)}
          onSubmit={handleCustomOrder}
          title="Request Custom Quote"
          description="Get a personalized quote for your order:"
          isCustomOrder={true}
        />
      )}
    </div>
  );
}
