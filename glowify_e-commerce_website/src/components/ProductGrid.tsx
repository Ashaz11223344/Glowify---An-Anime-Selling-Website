import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductCard } from "./ProductCard";
import { Package, Sparkles } from "lucide-react";

interface ProductGridProps {
  searchQuery: string;
  selectedAnime: string;
  sortBy: string;
  onProductClick: (productId: string) => void;
}

export function ProductGrid({ searchQuery, selectedAnime, sortBy, onProductClick }: ProductGridProps) {
  const products = useQuery(api.products.list, {
    search: searchQuery || undefined,
    animeName: selectedAnime || undefined,
    sortBy: sortBy || undefined,
  });

  if (products === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <Package className="w-6 h-6 text-primary mr-2 glow-primary" />
          <h2 className="text-2xl font-bold text-foreground">All Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-xl">No products found</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <Package className="w-6 h-6 text-primary mr-2 glow-primary" />
        <h2 className="text-2xl font-bold text-foreground">All Products</h2>
        <span className="ml-3 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
          {products.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => onProductClick(product._id)}
          />
        ))}
      </div>
    </div>
  );
}
