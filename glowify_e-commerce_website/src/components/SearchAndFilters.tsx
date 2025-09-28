import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Filter, Sparkles } from "lucide-react";

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAnime: string;
  setSelectedAnime: (anime: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedAnime,
  setSelectedAnime,
  sortBy,
  setSortBy,
}: SearchAndFiltersProps) {
  const animeNames = useQuery(api.products.getAnimeNames) || [];

  return (
    <div className="glass rounded-2xl p-6 hover-glow">
      <div className="flex items-center mb-6">
        <Sparkles className="w-6 h-6 text-primary mr-2 glow-primary" />
        <h2 className="text-xl font-semibold text-foreground">Find Your Perfect Poster</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search posters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover-glow"
          />
        </div>

        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <select
            value={selectedAnime}
            onChange={(e) => setSelectedAnime(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none hover-glow"
          >
            <option value="">All Anime</option>
            {animeNames.map((anime) => (
              <option key={anime} value={anime} className="bg-card">
                {anime}
              </option>
            ))}
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none hover-glow"
        >
          <option value="">Sort By</option>
          <option value="popularity" className="bg-card">Most Popular</option>
          <option value="rating" className="bg-card">Highest Rated</option>
          <option value="price_asc" className="bg-card">Price: Low to High</option>
          <option value="price_desc" className="bg-card">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
