import {
  getThemePresetById,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESET_VAR_KEYS,
} from "@/constants/theme-presets";

type ThemeMode = "light" | "dark";

export const readStoredThemePresetId = (): string | null => {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);
  return getThemePresetById(id) ? id : null;
};

export const saveThemePresetId = (presetId: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
};

export const clearThemePresetOverrides = () => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  THEME_PRESET_VAR_KEYS.forEach((key) => root.style.removeProperty(key));
};

export const applyThemePresetById = (
  presetId: string | null,
  mode: ThemeMode,
) => {
  if (typeof document === "undefined") return;

  clearThemePresetOverrides();

  const preset = getThemePresetById(presetId);
  if (!preset) return;

  const variables = mode === "dark" ? preset.dark : preset.light;
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
