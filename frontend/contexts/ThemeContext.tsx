"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTheme } from "next-themes";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  getGradientClass: (
    type: "primary" | "secondary" | "accent" | "card"
  ) => string;
  getGlassEffectClass: () => string;
  getHoverLiftClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300" />
    );
  }

  // Gradient class getter
  const getGradientClass = (
    type: "primary" | "secondary" | "accent" | "card"
  ): string => {
    switch (type) {
      case "primary":
        return "bg-gradient-primary";
      case "secondary":
        return "bg-gradient-secondary";
      case "accent":
        return "bg-gradient-accent";
      case "card":
        return "bg-gradient-card";
      default:
        return "bg-gradient-primary";
    }
  };

  // Glass effect class getter
  const getGlassEffectClass = (): string => {
    return resolvedTheme === "dark" ? "glass-effect-dark" : "glass-effect";
  };

  // Hover lift class getter
  const getHoverLiftClass = (): string => {
    return "hover-lift";
  };

  const value: ThemeContextType = {
    theme: (theme as Theme) || "system",
    setTheme: (newTheme: Theme) => {
      // Add smooth transition when changing themes
      document.documentElement.style.transition =
        "background-color 0.3s ease, color 0.3s ease";
      setTheme(newTheme);
      // Remove transition after theme change
      setTimeout(() => {
        document.documentElement.style.transition = "";
      }, 300);
    },
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system",
    getGradientClass,
    getGlassEffectClass,
    getHoverLiftClass,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className="transition-colors duration-300">{children}</div>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
