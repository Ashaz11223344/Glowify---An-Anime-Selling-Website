import { useState } from "react";
import { X, MessageCircle, Mail, User, MapPin, Phone, AtSign } from "lucide-react";
import { toast } from "sonner";
import { CouponInput } from "./CouponInput";

interface OrderMethodModalProps {
  onClose: () => void;
  onSubmit: (method: "whatsapp" | "email", customerData: any, couponData?: any) => void;
  title: string;
  description: string;
  isCustomOrder?: boolean;
}

export function OrderMethodModal({ 
  onClose, 
  onSubmit, 
  title, 
  description, 
  isCustomOrder = false 
}: OrderMethodModalProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<"whatsapp" | "email" | null>(null);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [couponData, setCouponData] = useState<any>(null);

  const handleMethodSelect = (method: "whatsapp" | "email") => {
    setSelectedMethod(method);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!selectedMethod) return;
    
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit(selectedMethod, customerData, couponData);
    onClose();
  };

  const handleCouponApplied = (data: any) => {
    setCouponData(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-primary/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-muted-foreground">{description}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleMethodSelect("whatsapp")}
                className="w-full p-4 border-2 border-border hover:border-green-500 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Send order via WhatsApp message
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("email")}
                className="w-full p-4 border-2 border-border hover:border-blue-500 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Send order via email
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Your order details will be pre-filled and ready to send!</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                {selectedMethod === "whatsapp" ? (
                  <MessageCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Mail className="w-5 h-5 text-blue-600" />
                )}
                <span className="font-semibold">
                  {selectedMethod === "whatsapp" ? "WhatsApp" : "Email"} Order
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address *
                </label>
                <textarea
                  value={customerData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              {!isCustomOrder && (
                <div className="border-t border-border pt-4">
                  <CouponInput onCouponApplied={handleCouponApplied} />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border hover:border-primary/50 text-foreground py-3 px-6 rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all text-white ${
                  selectedMethod === "whatsapp"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCustomOrder ? "Request Quote" : "Send Order"}
              </button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                Your {selectedMethod === "whatsapp" ? "WhatsApp" : "email"} app will open with 
                pre-filled order details ready to send!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
