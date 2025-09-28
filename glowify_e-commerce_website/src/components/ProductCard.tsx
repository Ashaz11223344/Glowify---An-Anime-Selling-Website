import { Star, ShoppingCart, Zap } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProductCardProps {
  product: any;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const addToCart = useMutation(api.cart.add);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart({ productId: product._id, quantity: 1 });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Please sign in to add items to cart");
    }
  };

  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl p-6 hover-glow transition-all cursor-pointer group hover:scale-105 float relative overflow-hidden"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="aspect-square mb-4 overflow-hidden rounded-xl relative">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <>
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center rounded-xl">
              <Zap className="w-12 h-12 text-primary-foreground" />
            </div>
          )}
          
          {/* Stock indicator */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {product.stock} left
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-bold">
              Sold Out
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-foreground font-bold text-lg line-clamp-2 group-hover:text-neon transition-colors">
            {product.name}
          </h3>
          <p className="text-primary text-sm font-medium">{product.animeName}</p>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-muted-foreground text-sm ml-1">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-3xl font-bold text-neon">₹{product.price}</span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-gradient-primary hover:glow-primary text-primary-foreground p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-110"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
