import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BuyNowModal } from "./BuyNowModal";

interface CartProps {
  onBack: () => void;
}

export function Cart({ onBack }: CartProps) {
  const cartItems = useQuery(api.cart.list) || [];
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.remove);
  const clearCart = useMutation(api.cart.clear);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item?.product?.price || 0) * (item?.quantity || 0),
    0
  );

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity({ itemId: itemId as any, quantity: newQuantity });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem({ itemId: itemId as any });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const handleBuyNow = (item: any) => {
    setSelectedItem(item);
    setShowBuyModal(true);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors hover-glow p-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>

        <div className="text-center py-16">
          <div className="glass rounded-2xl p-12 max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some amazing Glowify posters to get started!</p>
            <button
              onClick={onBack}
              className="bg-gradient-primary hover:glow-primary text-primary-foreground px-8 py-4 rounded-xl transition-all font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors hover-glow p-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <button
          onClick={handleClearCart}
          className="text-destructive hover:text-destructive/80 transition-colors hover-glow p-2 rounded-lg"
        >
          Clear Cart
        </button>
      </div>

      <div className="glass rounded-2xl p-8 hover-glow">
        <div className="flex items-center mb-8">
          <ShoppingBag className="w-8 h-8 text-primary mr-3 glow-primary" />
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <span className="ml-3 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
            {cartItems.length} items
          </span>
        </div>

        <div className="space-y-6 mb-8">
          {cartItems.filter(Boolean).map((item) => {
            if (!item) return null;
            return (
            <div
              key={item._id}
              className="flex items-center space-x-6 p-6 glass rounded-xl hover-glow"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                  <img
                    src={item.product.imageUrls[0] || ""}
                    alt={item.product.name || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="text-primary-foreground text-sm" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-foreground font-bold text-lg">{item.product?.name}</h3>
                <p className="text-primary text-sm font-medium">{item.product?.animeName}</p>
                <p className="text-neon font-bold text-xl">₹{item.product?.price}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  className="w-10 h-10 glass border border-border rounded-lg text-foreground hover:text-primary hover:border-primary transition-all"
                >
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <span className="w-12 text-center text-foreground font-bold text-lg">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  className="w-10 h-10 glass border border-border rounded-lg text-foreground hover:text-primary hover:border-primary transition-all"
                  disabled={item.quantity >= (item.product?.stock || 0)}
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-neon font-bold text-2xl mb-3">
                  ₹{(item.product?.price || 0) * item.quantity}
                </p>
                <button
                  onClick={() => handleBuyNow(item)}
                  className="bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-2 rounded-lg transition-all font-semibold mb-2"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={() => handleRemoveItem(item._id)}
                className="text-destructive hover:text-destructive/80 transition-colors p-2 rounded-lg hover-glow"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-neon">Total: ₹{totalAmount}</span>
            <button
              onClick={onBack}
              className="bg-gradient-secondary hover:glow-secondary text-secondary-foreground px-10 py-4 rounded-xl transition-all font-bold text-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {showBuyModal && selectedItem && (
        <BuyNowModal
          isOpen={showBuyModal}
          productId={selectedItem.product._id}
          quantity={selectedItem.quantity}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
