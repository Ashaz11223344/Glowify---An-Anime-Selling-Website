import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useState } from "react";
import { ProductGrid } from "./components/ProductGrid";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { AdminDashboard } from "./components/AdminDashboard";
import { AccountSettings } from "./components/AccountSettings";
import { Header } from "./components/Header";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { TopSellingProducts } from "./components/TopSellingProducts";
import { Sparkles, Lock } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "product" | "cart" | "admin" | "account">("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userDisplayName = useQuery(api.userProfiles.getUserDisplayName);
  const isAdmin = useQuery(api.admin.isAdmin);
  const cartCount = useQuery(api.cart.getCount);
  const setupFirstAdmin = useMutation(api.admin.setupFirstAdmin);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView("product");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Unauthenticated>
        {/* Full-screen sign-in overlay */}
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-animated-gradient opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-xl float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-secondary/20 rounded-full blur-xl float" style={{animationDelay: '4s'}}></div>
          
          <div className="relative z-10 w-full max-w-sm sm:max-w-md">
            {/* Logo and branding */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-primary mr-2 sm:mr-4 pulse-glow" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Glowify
                </h1>
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-accent ml-2 sm:ml-4 pulse-glow" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
              </div>
              <p className="text-lg sm:text-xl text-muted-foreground font-light mb-4">
                Anime-Inspired LED Glow Posters
              </p>
              <div className="w-20 sm:w-24 h-1 bg-gradient-primary mx-auto rounded-full glow-primary"></div>
            </div>

            {/* Sign-in form container */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover-glow border-2 border-primary/20">
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 sm:mr-3 glow-primary" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Welcome Back</h2>
              </div>
              
              <SignInForm />
              
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Sign in to access your personalized anime poster collection
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-muted-foreground text-xs sm:text-sm">
                © 2024 Glowify. Illuminate your space with anime magic.
              </p>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <Header 
          onCartClick={() => setCurrentView("cart")}
          onHomeClick={handleBackToHome}
          onAdminClick={() => setCurrentView("admin")}
          onAccountClick={() => setCurrentView("account")}
          cartCount={cartCount || 0}
          isAdmin={isAdmin || false}
          currentView={currentView}
        />

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {currentView === "home" && (
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {/* Welcome Section */}
              <div className="text-center mb-8 sm:mb-12 md:mb-16 relative">
                <div className="absolute inset-0 bg-animated-gradient opacity-30 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <Sparkles className="w-12 h-12 text-primary mr-4 pulse-glow" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                      Glowify
                    </h1>
                    <Sparkles className="w-12 h-12 text-accent ml-4 pulse-glow" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 font-light">
                    Anime-Inspired LED Glow Posters
                  </p>
                  <div className="w-32 h-1 bg-gradient-primary mx-auto rounded-full glow-primary"></div>
                  
                  <div className="text-center mt-8 sm:mt-10 md:mt-12">
                    <div className="glass rounded-xl p-4 sm:p-6 max-w-sm sm:max-w-md mx-auto">
                      <p className="text-lg sm:text-xl text-foreground">
                        Welcome back, <span className="text-neon font-semibold">{userDisplayName?.displayName || "User"}</span>!
                      </p>
                      {loggedInUser?.email === "ashazpathan8@gmail.com" && !isAdmin && (
                        <button
                          onClick={() => setupFirstAdmin({ email: "ashazpathan8@gmail.com" })}
                          className="mt-4 bg-gradient-primary hover:glow-primary text-primary-foreground px-6 py-2 rounded-lg transition-all font-semibold"
                        >
                          Grant Admin Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <TopSellingProducts onProductClick={handleProductClick} />

              <SearchAndFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedAnime={selectedAnime}
                setSelectedAnime={setSelectedAnime}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              <ProductGrid
                searchQuery={searchQuery}
                selectedAnime={selectedAnime}
                sortBy={sortBy}
                onProductClick={handleProductClick}
              />
            </div>
          )}

          {currentView === "product" && selectedProductId && (
            <ProductDetail
              productId={selectedProductId}
              onBack={handleBackToHome}
            />
          )}

          {currentView === "cart" && (
            <Cart onBack={handleBackToHome} />
          )}

          {currentView === "admin" && isAdmin && (
            <AdminDashboard onBack={handleBackToHome} />
          )}

          {currentView === "account" && (
            <AccountSettings onBack={handleBackToHome} />
          )}
        </main>
      </Authenticated>

      <Toaster 
        theme="dark" 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}
