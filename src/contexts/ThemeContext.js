import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "sars-theme-preference";
const MOTION_KEY = "sars-reduce-motion";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem(STORAGE_KEY);
    const storedReduceMotion = localStorage.getItem(MOTION_KEY);

    if (["light", "dark", "system"].includes(storedPreference)) {
      setPreference(storedPreference);
    }

    if (storedReduceMotion !== null) {
      setReduceMotion(storedReduceMotion === "true");
    } else {
      setReduceMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
  }, []);

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextTheme = preference === "system" ? getSystemTheme() : preference;
      setResolvedTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
    };

    syncTheme();
    darkQuery.addEventListener("change", syncTheme);

    return () => {
      darkQuery.removeEventListener("change", syncTheme);
    };
  }, [preference]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    localStorage.setItem(MOTION_KEY, String(reduceMotion));
    document.documentElement.setAttribute(
      "data-reduce-motion",
      String(reduceMotion),
    );
  }, [reduceMotion]);

  const value = useMemo(
    () => ({
      preference,
      theme: resolvedTheme,
      reduceMotion,
      setPreference,
      setReduceMotion,
      toggleTheme: () => {
        const current = preference === "system" ? resolvedTheme : preference;
        setPreference(current === "dark" ? "light" : "dark");
      },
    }),
    [preference, reduceMotion, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
