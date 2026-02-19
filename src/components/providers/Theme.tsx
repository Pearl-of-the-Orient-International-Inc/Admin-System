"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { THEME_PRESET_STORAGE_KEY } from "@/constants/theme-presets"
import { applyThemePresetById, readStoredThemePresetId } from "@/lib/theme-preset"

function ThemePresetApplier() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return

    const presetId = readStoredThemePresetId()
    applyThemePresetById(presetId, resolvedTheme === "dark" ? "dark" : "light")
  }, [resolvedTheme])

  React.useEffect(() => {
    if (!resolvedTheme) return

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== THEME_PRESET_STORAGE_KEY) return
      const presetId = readStoredThemePresetId()
      applyThemePresetById(presetId, resolvedTheme === "dark" ? "dark" : "light")
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemePresetApplier />
      {children}
    </NextThemesProvider>
  )
}
