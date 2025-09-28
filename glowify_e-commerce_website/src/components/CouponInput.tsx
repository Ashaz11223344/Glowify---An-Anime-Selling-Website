import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Tag, Check, X } from "lucide-react";
import { toast } from "sonner";

interface CouponInputProps {
  onCouponApplied?: (data: { couponCode: string; discountAmount: number; discountType: string; discountValue: number }) => void;
}

export function CouponInput({ onCouponApplied }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const validateCoupon = useMutation(api.coupons.validateCoupon);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    
    try {
      const result = await validateCoupon({ code: couponCode.trim().toUpperCase() });
      
      if (result.isValid) {
        setAppliedCoupon(result);
        toast.success(`Coupon applied! You saved ₹${result.discountAmount}`);
        
        if (onCouponApplied) {
          onCouponApplied({
            couponCode: couponCode.trim().toUpperCase(),
            discountAmount: result.discountAmount,
            discountType: result.discountType,
            discountValue: result.discountValue
          });
        }
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
    
    if (onCouponApplied) {
      onCouponApplied({
        couponCode: "",
        discountAmount: 0,
        discountType: "",
        discountValue: 0
      });
    }
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">
                {couponCode.toUpperCase()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                You saved ₹{appliedCoupon.discountAmount}!
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <span className="font-semibold">Have a coupon?</span>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={isApplying || !couponCode.trim()}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          {isApplying ? "..." : "Apply"}
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Enter your coupon code to get a discount on your order
      </p>
    </div>
  );
}
