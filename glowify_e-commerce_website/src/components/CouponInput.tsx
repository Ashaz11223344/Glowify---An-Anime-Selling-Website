import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Tag, Check, X, Loader2 } from "lucide-react";

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (couponCode: string, discountAmount: number, finalAmount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

export function CouponInput({ orderAmount, onCouponApplied, onCouponRemoved, appliedCoupon }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const couponValidation = useQuery(
    api.coupons.validateCoupon,
    couponCode && couponCode.length >= 3 ? { code: couponCode, orderAmount } : "skip"
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    
    try {
      // Wait a moment for the validation query to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (couponValidation?.valid) {
        onCouponApplied(couponCode.toUpperCase(), couponValidation.discountAmount || 0, couponValidation.finalAmount || 0);
        toast.success(`Coupon applied! You saved ₹${couponValidation.discountAmount}`);
      } else {
        toast.error(couponValidation?.error || "Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    onCouponRemoved();
    toast.success("Coupon removed");
  };

  if (appliedCoupon) {
    return (
      <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Coupon Applied: {appliedCoupon}</span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Have a coupon code?</span>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <button
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim() || isValidating}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Apply
        </button>
      </div>

      {couponCode && couponValidation && !couponValidation.valid && (
        <p className="text-sm text-red-400">{couponValidation.error}</p>
      )}

      {couponCode && couponValidation?.valid && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400">
            ✓ Valid coupon! You'll save ₹{couponValidation.discountAmount}
          </p>
        </div>
      )}
    </div>
  );
}
