"use client";

import { useTheme } from "@/components/ThemeProvider";

const labels: Record<string, string> = {
  light: "🌞",
  dark: "🌙",
  auto: "🖥️",
};

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    >
      {labels[theme]}
    </button>
  );
}
