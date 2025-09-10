import { ShoppingCart, Home, Shield, User } from "lucide-react";

interface HeaderProps {
  onCartClick: () => void;
  onHomeClick: () => void;
  onAdminClick: () => void;
  onAccountClick: () => void;
  cartCount: number;
  isAdmin: boolean;
  currentView: string;
}

export function Header({ 
  onCartClick, 
  onHomeClick, 
  onAdminClick, 
  onAccountClick,
  cartCount, 
  isAdmin, 
  currentView 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">G</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-neon">Glowify</span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onHomeClick}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
                currentView === "home"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Home</span>
            </button>

            <button
              onClick={onCartClick}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all relative touch-manipulation ${
                currentView === "cart"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onAccountClick}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
                currentView === "account"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Account</span>
            </button>

            {isAdmin && (
              <button
                onClick={onAdminClick}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
                  currentView === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Admin</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
