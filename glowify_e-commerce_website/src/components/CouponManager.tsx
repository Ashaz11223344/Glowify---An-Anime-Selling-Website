import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Plus, Tag, Calendar, Percent, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";

export function CouponManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    description: "",
  });

  const coupons = useQuery(api.coupons.listCoupons);
  const createCoupon = useMutation(api.coupons.createCoupon);
  const toggleCouponStatus = useMutation(api.coupons.toggleCouponStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createCoupon({
        code: formData.code,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        validFrom: new Date(formData.validFrom).getTime(),
        validUntil: new Date(formData.validUntil).getTime(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        description: formData.description || undefined,
      });

      toast.success("Coupon created successfully!");
      setShowCreateForm(false);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        validFrom: "",
        validUntil: "",
        usageLimit: "",
        description: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create coupon");
    }
  };

  const handleToggleStatus = async (couponId: any) => {
    try {
      await toggleCouponStatus({ couponId });
      toast.success("Coupon status updated!");
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Coupon Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-gradient-primary hover:glow-primary text-primary-foreground px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {showCreateForm && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Coupon</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g., SAVE50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder={formData.discountType === "percentage" ? "50" : "300"}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="100"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valid From *</label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valid Until *</label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Special discount for new customers"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-2 rounded-lg transition-all"
              >
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons?.map((coupon) => (
          <div key={coupon._id} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{coupon.code}</h3>
                  {coupon.description && (
                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(coupon._id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
                  coupon.isActive
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                }`}
              >
                {coupon.isActive ? (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    Inactive
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {coupon.discountType === "percentage" ? (
                  <Percent className="w-4 h-4 text-accent" />
                ) : (
                  <DollarSign className="w-4 h-4 text-accent" />
                )}
                <span>
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% off`
                    : `₹${coupon.discountValue} off`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>
                  {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Used: </span>
                <span>{coupon.usedCount}</span>
                {coupon.usageLimit && <span> / {coupon.usageLimit}</span>}
              </div>

              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className={coupon.isActive ? "text-green-400" : "text-red-400"}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {coupons?.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No coupons created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
