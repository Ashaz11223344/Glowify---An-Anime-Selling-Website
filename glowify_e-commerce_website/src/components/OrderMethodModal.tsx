import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { X, MessageCircle, Mail, Loader2 } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface OrderMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: Id<"products">;
  productName: string;
  quantity: number;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export function OrderMethodModal({
  isOpen,
  onClose,
  productId,
  productName,
  quantity,
  totalAmount,
  discountAmount = 0,
  couponCode,
  customerDetails,
}: OrderMethodModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrder = useMutation(api.orders.createOrder);
  const sendOrderEmail = useAction(api.orders.sendOrderEmail);

  if (!isOpen) return null;

  const handleOrderMethod = async (method: "whatsapp" | "email") => {
    setIsProcessing(true);
    
    try {
      const orderId = await createOrder({
        customerName: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,
        productId,
        quantity,
        couponCode,
        orderMethod: method,
      });

      if (method === "whatsapp") {
        const whatsappNumber = "+918308553555";
        const message = `Hi! I'd like to place an order:

🛍️ *Order Details:*
Product: ${productName}
Quantity: ${quantity}
${discountAmount > 0 ? `Original Amount: ₹${totalAmount + discountAmount}` : ''}
${discountAmount > 0 ? `Discount: -₹${discountAmount} (${couponCode})` : ''}
Total Amount: ₹${totalAmount}

👤 *Customer Details:*
Name: ${customerDetails.name}
Email: ${customerDetails.email}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}

Order ID: ${orderId}

Please confirm my order. Thank you!`;

        const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        toast.success("Order created! Redirecting to WhatsApp...");
      } else {
        const emailData = await sendOrderEmail({ orderId });
        window.open(emailData.mailtoUrl, '_blank');
        
        toast.success("Order created! Opening email client...");
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Choose Order Method</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">{productName}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Quantity: {quantity}</p>
              {discountAmount > 0 && (
                <>
                  <p>Original: ₹{totalAmount + discountAmount}</p>
                  <p className="text-green-400">Discount: -₹{discountAmount} ({couponCode})</p>
                </>
              )}
              <p className="text-lg font-semibold text-foreground">Total: ₹{totalAmount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOrderMethod("whatsapp")}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
            Order via WhatsApp
          </button>

          <button
            onClick={() => handleOrderMethod("email")}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            Order via Email
          </button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>WhatsApp: +91 830855355</p>
          <p>Email: ashazpathan8@gmail.com, aryashejwal900@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
