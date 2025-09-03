import { useEffect, useLayoutEffect, useMemo, useState } from "react";

export function useTheme() {
  const getSavedTheme = () => {
    try {
      return localStorage.getItem("theme") as "dark" | "light" | null;
    } catch {
      return null;
    }
  };

  const prefersDark = useMemo(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    )
      return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Compute initial value synchronously to minimize flicker
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = getSavedTheme();
    return saved ? saved === "dark" : prefersDark;
  });

  // Apply theme class & persist choice
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");

      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");

      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // If no saved theme, react to system changes
  useEffect(() => {
    const saved = getSavedTheme();
    if (saved) return; // user has an explicit choice

    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    )
      return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    // Older Safari compatibility
    try {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } catch {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);

  const toggleTheme = () => setIsDark((d) => !d);
  const setDark = (value: boolean) => setIsDark(value);

  return { isDark, toggleTheme, setDark };
}
