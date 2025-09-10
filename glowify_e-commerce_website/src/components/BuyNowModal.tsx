import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { CouponInput } from "./CouponInput";
import { OrderMethodModal } from "./OrderMethodModal";

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: Id<"products">;
  quantity: number;
}

export function BuyNowModal({ isOpen, onClose, productId, quantity }: BuyNowModalProps) {
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [showOrderMethodModal, setShowOrderMethodModal] = useState(false);

  const product = useQuery(api.products.getById, { id: productId });
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (!isOpen || !product) return null;

  const originalAmount = product.price * quantity;
  const totalAmount = appliedCoupon ? appliedCoupon.finalAmount : originalAmount;

  const handleCouponApplied = (code: string, discountAmount: number, finalAmount: number) => {
    setAppliedCoupon({ code, discountAmount, finalAmount });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const handleProceedToOrder = () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
      alert("Please fill in all customer details");
      return;
    }
    setShowOrderMethodModal(true);
  };

  // Pre-fill user details if available
  const prefillUserDetails = () => {
    if (loggedInUser?.email && !customerDetails.email) {
      setCustomerDetails(prev => ({ ...prev, email: loggedInUser.email || "" }));
    }
    if (userProfile?.name && !customerDetails.name) {
      setCustomerDetails(prev => ({ ...prev, name: userProfile.name || "" }));
    }
    if (userProfile?.defaultAddress?.address && !customerDetails.address) {
      setCustomerDetails(prev => ({ ...prev, address: userProfile.defaultAddress?.address || "" }));
    }
  };

  // Auto-prefill on modal open
  if (isOpen && loggedInUser && !customerDetails.email) {
    prefillUserDetails();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Summary */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <div className="flex justify-between text-sm">
              <span>Quantity: {quantity}</span>
              <span>Price: ₹{product.price} each</span>
            </div>
            <div className="flex justify-between font-semibold mt-2">
              <span>Subtotal:</span>
              <span>₹{originalAmount}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="mb-6">
            <CouponInput
              orderAmount={originalAmount}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon?.code}
            />
          </div>

          {/* Total Amount */}
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            {appliedCoupon && (
              <div className="flex justify-between text-sm mb-2">
                <span>Original Amount:</span>
                <span>₹{originalAmount}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-400 mb-2">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-₹{appliedCoupon.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">₹{totalAmount}</span>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Customer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your complete delivery address"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToOrder}
              className="flex-1 bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-3 rounded-lg transition-all font-semibold"
            >
              Proceed to Order
            </button>
          </div>
        </div>
      </div>

      <OrderMethodModal
        isOpen={showOrderMethodModal}
        onClose={() => setShowOrderMethodModal(false)}
        productId={productId}
        productName={product.name}
        quantity={quantity}
        totalAmount={totalAmount}
        discountAmount={appliedCoupon?.discountAmount}
        couponCode={appliedCoupon?.code}
        customerDetails={customerDetails}
      />
    </>
  );
}
