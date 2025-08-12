"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useASTLocalStorage } from "@/hooks/useLocalStorage";

type Theme = "light" | "dark" | "auto";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, setPreferences } = useASTLocalStorage();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    () => (preferences.theme === "auto" ? getSystemTheme() : preferences.theme)
  );

  useEffect(() => {
    const applyTheme = () => {
      const current = preferences.theme === "auto" ? getSystemTheme() : preferences.theme;
      setResolvedTheme(current);
      document.documentElement.setAttribute("data-theme", current);
    };

    applyTheme();

    if (preferences.theme === "auto") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", applyTheme);
      return () => media.removeEventListener("change", applyTheme);
    }
  }, [preferences.theme]);

  const setTheme = (theme: Theme) => setPreferences((prev) => ({ ...prev, theme }));

  const toggleTheme = () => {
    const order: Theme[] = ["light", "dark", "auto"];
    const index = order.indexOf(preferences.theme);
    setTheme(order[(index + 1) % order.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme: preferences.theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeProvider;
