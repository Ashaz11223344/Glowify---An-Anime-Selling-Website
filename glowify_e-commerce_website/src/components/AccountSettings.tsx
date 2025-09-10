import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  History, 
  Trash2, 
  Save,
  ArrowLeft,
  Home,
  Building,
  MapPinIcon,
  AlertTriangle
} from "lucide-react";

interface AccountSettingsProps {
  onBack: () => void;
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const userOrders = useQuery(api.userProfiles.getUserOrders);
  const canDelete = useQuery(api.userProfiles.canDeleteAccount);
  
  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const updateDefaultAddress = useMutation(api.userProfiles.updateDefaultAddress);
  const deleteAccount = useMutation(api.userProfiles.deleteAccount);

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "address" | "danger">("profile");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Office" | "Other">("Home");
  const [address, setAddress] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state with userProfile data when it loads
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setBirthdate(userProfile.birthdate || "");
      setAddressType(userProfile.defaultAddress?.type || "Home");
      setAddress(userProfile.defaultAddress?.address || "");
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: name || undefined, birthdate: birthdate || undefined });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    
    try {
      await updateDefaultAddress({ type: addressType, address: address.trim() });
      toast.success("Default address updated successfully");
    } catch (error) {
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-400";
      case "confirmed": return "text-blue-400";
      case "completed": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "Home": return <Home className="w-4 h-4" />;
      case "Office": return <Building className="w-4 h-4" />;
      default: return <MapPinIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-card hover:bg-muted transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neon">Account Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-xl p-1 sm:p-2">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "orders", label: "Orders", icon: Package },
            { id: "address", label: "Address", icon: MapPin },
            { id: "danger", label: "Account", icon: Trash2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap touch-manipulation ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm sm:text-base">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass rounded-xl p-4 sm:p-6 md:p-8">
        {activeTab === "profile" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email</label>
                <input
                  type="email"
                  value={loggedInUser?.email || ""}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-muted rounded-lg text-muted-foreground cursor-not-allowed text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="auth-input-field text-sm sm:text-base py-2 sm:py-3 touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Birthdate</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="auth-input-field"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="flex items-center space-x-2 bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-3 rounded-lg transition-all font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Order History</h2>
            </div>

            {/* Live Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Live Orders ({userOrders?.liveOrders.length || 0})</span>
              </h3>
              
              {userOrders?.liveOrders.length === 0 ? (
                <p className="text-muted-foreground">No active orders</p>
              ) : (
                <div className="space-y-3">
                  {userOrders?.liveOrders.map((order) => (
                    <div key={order._id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{order.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {order.quantity} • ${order.totalAmount}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(order._creationTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Completed Orders ({userOrders?.completedOrders.length || 0})</span>
              </h3>
              
              {userOrders?.completedOrders.length === 0 ? (
                <p className="text-muted-foreground">No completed orders</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {userOrders?.completedOrders.map((order) => (
                    <div key={order._id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{order.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {order.quantity} • ${order.totalAmount}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(order._creationTime)}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full Order History */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Full Order History ({userOrders?.allOrders.length || 0})</span>
              </h3>
              
              {userOrders?.allOrders.length === 0 ? (
                <p className="text-muted-foreground">No order history</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userOrders?.allOrders.map((order) => (
                    <div key={order._id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{order.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {order.quantity} • ${order.totalAmount}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(order._creationTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Default Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address Type</label>
                <div className="flex space-x-4">
                  {(["Home", "Office", "Other"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAddressType(type)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        addressType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {getAddressIcon(type)}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                  className="auth-input-field resize-none"
                />
              </div>

              <button
                onClick={handleSaveAddress}
                className="flex items-center space-x-2 bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-3 rounded-lg transition-all font-semibold"
              >
                <Save className="w-4 h-4" />
                <span>Save Address</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-semibold">Account Management</h2>
            </div>

            {/* Sign Out Section */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">Sign Out</h3>
              <p className="text-muted-foreground mb-4">
                Sign out of your account. You can sign back in anytime.
              </p>
              <SignOutButton />
            </div>

            {/* Delete Account Section */}
            <div className="bg-destructive/10 rounded-lg p-6 border border-destructive/20">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Delete Account</h3>
              <p className="text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>

              {!canDelete && (
                <div className="flex items-start space-x-3 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-500">Account deletion restricted</p>
                    <p className="text-xs text-yellow-500/80 mt-1">
                      You cannot delete your account while you have pending or confirmed orders.
                    </p>
                  </div>
                </div>
              )}

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!canDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-destructive">
                    Are you sure you want to delete your account? This will permanently remove:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Your profile information</li>
                    <li>• Your order history</li>
                    <li>• Your reviews and ratings</li>
                    <li>• Your cart items</li>
                    <li>• All account data</li>
                  </ul>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-lg transition-all font-semibold"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-card hover:bg-muted text-foreground px-6 py-3 rounded-lg transition-all font-semibold border border-border"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
