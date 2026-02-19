"use client";

import { ThemeSwitcher } from "@/components/kibo-ui/ThemeSwitcher";
import { useTheme } from "next-themes"

type ThemeKey = "light" | "dark" | "system";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()
  const themeValue: ThemeKey | undefined =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : undefined;

  return (
    <ThemeSwitcher
      defaultValue="system"
      onChangeAction={setTheme}
      value={themeValue}
    />
  );
};

