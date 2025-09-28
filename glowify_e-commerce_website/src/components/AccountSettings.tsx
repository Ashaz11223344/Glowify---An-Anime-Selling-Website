import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, User, Package, Camera } from "lucide-react";
import { OrdersList } from "./OrdersList";
import { CustomOrdersList } from "./CustomOrdersList";
// import { UserProfileForm } from "./UserProfileForm";

interface AccountSettingsProps {
  onBack: () => void;
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "custom-orders">("profile");
  
  const orders = useQuery(api.orders.getUserOrders);
  const customOrders = useQuery(api.customOrders.getUserCustomOrders);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package, count: orders?.length },
    { id: "custom-orders", label: "Custom Orders", icon: Camera, count: customOrders?.length },
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
          Account Settings
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
        {activeTab === "profile" && (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Profile Settings</h3>
            <p className="text-muted-foreground">Profile management coming soon!</p>
          </div>
        )}
        {activeTab === "orders" && <OrdersList />}
        {activeTab === "custom-orders" && <CustomOrdersList />}
      </div>
    </div>
  );
}
