/**
 * Theme Provider for Raksha Setu
 * Supports Light, Dark, and System modes using next-themes.
 */
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemeProvider>
  );
}
