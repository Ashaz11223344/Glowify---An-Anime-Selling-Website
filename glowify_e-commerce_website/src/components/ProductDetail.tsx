import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, ShoppingCart, Star, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ReviewSection } from "./ReviewSection";
import { BuyNowModal } from "./BuyNowModal";

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const product = useQuery(api.products.getById, { id: productId as any });
  const addToCart = useMutation(api.cart.add);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: product._id, quantity });
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error("Please sign in to add items to cart");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-black/20 border border-purple-500/20">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[currentImageIndex] || ""}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">No Image</span>
              </div>
            )}
          </div>

          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? "border-purple-500" : "border-gray-600"
                  }`}
                >
                  <img src={url || ""} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-purple-300 text-lg">{product.animeName}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white ml-1 text-lg">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-400 ml-2">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="text-4xl font-bold text-white">₹{product.price}</div>

          <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-white font-semibold">Quantity:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-white/10 border border-gray-600 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 bg-white/10 border border-gray-600 rounded-lg text-white hover:bg-white/20 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {product.stock > 0 ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white/10 border border-purple-500 text-white py-3 px-6 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg transition-all font-semibold"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <div className="bg-red-500/20 border border-red-500 text-red-300 py-3 px-6 rounded-lg text-center font-semibold">
                Out of Stock
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-orange-400 text-center">Only {product.stock} left in stock!</p>
            )}
          </div>
        </div>
      </div>

      <ReviewSection productId={product._id} />

      {showBuyModal && (
        <BuyNowModal
          isOpen={showBuyModal}
          productId={product._id}
          quantity={quantity}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
}
