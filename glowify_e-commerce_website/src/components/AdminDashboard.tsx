import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Package, ShoppingBag, Users, Camera } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { OrdersList } from "./OrdersList";
import { CustomOrdersList } from "./CustomOrdersList";
import { CouponManager } from "./CouponManager";

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "custom-orders" | "coupons">("products");
  
  const products = useQuery(api.products.list, { search: "", animeName: "", sortBy: "" });
  const orders = useQuery(api.orders.getAllOrders);
  const customOrders = useQuery(api.customOrders.getAllCustomOrders);

  const tabs = [
    { id: "products", label: "Products", icon: Package, count: products?.length },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: orders?.length },
    { id: "custom-orders", label: "Custom Orders", icon: Camera, count: customOrders?.length },
    { id: "coupons", label: "Coupons", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-xl p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass rounded-xl p-6">
        {activeTab === "products" && <ProductForm onClose={() => {}} />}
        {activeTab === "orders" && <OrdersList isAdmin={true} />}
        {activeTab === "custom-orders" && <CustomOrdersList isAdmin={true} />}
        {activeTab === "coupons" && <CouponManager />}
      </div>
    </div>
  );
}
