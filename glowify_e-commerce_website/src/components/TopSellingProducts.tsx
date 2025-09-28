import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductCard } from "./ProductCard";
import { TrendingUp, Flame } from "lucide-react";

interface TopSellingProductsProps {
  onProductClick: (productId: string) => void;
}

export function TopSellingProducts({ onProductClick }: TopSellingProductsProps) {
  const topProducts = useQuery(api.products.getTopSelling);

  if (!topProducts || topProducts.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-center mb-8">
        <Flame className="w-8 h-8 text-accent mr-3 glow-accent" />
        <h2 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
          Trending Now
        </h2>
        <TrendingUp className="w-8 h-8 text-primary ml-3 glow-primary" />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl opacity-30"></div>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topProducts.map((product, index) => (
            <div key={product._id} className="relative">
              {index < 3 && (
                <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
              )}
              <ProductCard
                product={product}
                onClick={() => onProductClick(product._id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
