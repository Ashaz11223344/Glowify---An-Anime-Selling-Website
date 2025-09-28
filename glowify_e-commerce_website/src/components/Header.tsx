import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { ShoppingCart, Home, Settings, User, Sparkles, Camera } from "lucide-react";

interface HeaderProps {
  onCartClick: () => void;
  onHomeClick: () => void;
  onAdminClick: () => void;
  onAccountClick: () => void;
  onCustomClick: () => void;
  cartCount: number;
  isAdmin: boolean;
  currentView: string;
}

export function Header({ 
  onCartClick, 
  onHomeClick, 
  onAdminClick, 
  onAccountClick,
  onCustomClick,
  cartCount, 
  isAdmin, 
  currentView 
}: HeaderProps) {
  const userDisplayName = useQuery(api.userProfiles.getUserDisplayName);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary pulse-glow" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Glowify
            </span>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Custom Photo Frame Button */}
            <button
              onClick={onCustomClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                currentView === "custom"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Custom Frame</span>
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                currentView === "cart"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Account */}
            <button
              onClick={onAccountClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                currentView === "account"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">
                {userDisplayName?.displayName || "Account"}
              </span>
            </button>

            {/* Admin */}
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentView === "admin"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Sign Out */}
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
