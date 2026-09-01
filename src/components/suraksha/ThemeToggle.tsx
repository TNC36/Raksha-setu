/**
 * Theme Toggle for Raksha Setu
 * Cycles through Light → Dark → System modes.
 */
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = typeof window !== "undefined";

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg border border-neutral-200 text-neutral-400" aria-label="Toggle theme">
        <Monitor className="w-4 h-4" />
      </button>
    );
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label =
    theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "System theme";

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label={label}
      title={label}
    >
      {theme === "light" ? (
        <Sun className="w-4 h-4" />
      ) : theme === "dark" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Monitor className="w-4 h-4" />
      )}
    </button>
  );
}
