"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-6 py-3 rounded-xl glass text-muted-foreground hover:text-foreground border border-border/50 font-semibold hover-glow transition-all hover:border-destructive/50 hover:text-destructive"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
