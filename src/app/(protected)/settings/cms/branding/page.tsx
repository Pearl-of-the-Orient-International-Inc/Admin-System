"use client";

import { useEffect, useRef, useState } from "react";
import { Heading } from "@/components/Heading";
import { LogoUploadCard } from "./_components/LogoUploadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPhotoPlus, IconPlus, IconTrash, IconGripVertical } from "@tabler/icons-react";
import Image from "next/image";
import { ThemePresetPicker } from "./_components/ThemePresetPicker";
import { getThemePresetById, type TweakcnPreset } from "@/constants/theme-presets";
import {
  applyThemePresetById,
  readStoredThemePresetId,
  saveThemePresetId,
} from "@/lib/theme-preset";
import { useTheme } from "next-themes";

type HeroSlide = {
  id: string;
  label: string;
  imageUrl: string | null;
};

type ThemeColorToken = {
  label: string;
  cssVar: string;
};

// ─── Color conversion helpers ────────────────────────────────────────────────

/** Clamp a value to [0, 255] and round to an integer. */
const clamp8 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Convert a linear-light sRGB channel to gamma-encoded sRGB [0–255]. */
const linearToSrgb = (c: number): number => {
  const abs = Math.abs(c);
  const encoded = abs <= 0.0031308 ? 12.92 * abs : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
  return clamp8((c < 0 ? -encoded : encoded) * 255);
};

/** CIE Lab → XYZ (D50 illuminant). */
const labToXyz = (L: number, a: number, b: number): [number, number, number] => {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const κ = 24389 / 27;
  const ε = 216 / 24389;
  const x = (fx ** 3 > ε ? fx ** 3 : (116 * fx - 16) / κ) * 0.3457 / 0.3585;
  const y = L > κ * ε ? ((L + 16) / 116) ** 3 : L / κ;
  const z = (fz ** 3 > ε ? fz ** 3 : (116 * fz - 16) / κ) * (1 - 0.3457 / 0.3585 - 0.2958 / 0.3585);
  // D50 white point
  return [x * 0.9642956764, y * 1.0, z * 0.8251046025];
};

/** XYZ (D50) → linear sRGB. */
const xyzToLinearSrgb = (x: number, y: number, z: number): [number, number, number] => [
  x *  3.1338561 + y * -1.6168667 + z * -0.4906146,
  x * -0.9787684 + y *  1.9161415 + z *  0.0334540,
  x *  0.0719453 + y * -0.2289914 + z *  1.4052427,
];

/** Parse lab(L% a b) or lab(L a b) → [r, g, b] 0–255. */
const parseLab = (str: string): [number, number, number] | null => {
  const m = str.match(/lab\(\s*([\d.+-]+)%?\s+([\d.+-]+)\s+([\d.+-]+)/i);
  if (!m) return null;
  const [L, a, b] = [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
  const [x, y, z] = labToXyz(L, a, b);
  const [lr, lg, lb] = xyzToLinearSrgb(x, y, z);
  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
};

/** Parse oklch(L C H) → [r, g, b] 0–255. */
const parseOklch = (str: string): [number, number, number] | null => {
  const m = str.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return null;
  const [L, C, H] = [parseFloat(m[1]) / (str.includes("%") ? 100 : 1), parseFloat(m[2]), parseFloat(m[3])];
  const hRad = (H * Math.PI) / 180;
  const a_ = C * Math.cos(hRad);
  const b_ = C * Math.sin(hRad);
  // OKLab → linear sRGB via the Björn Ottosson matrices
  const l_ = (L + 0.3963377774 * a_ + 0.2158037573 * b_) ** 3;
  const m_ = (L - 0.1055613458 * a_ - 0.0638541728 * b_) ** 3;
  const s_ = (L - 0.0894841775 * a_ - 1.2914855480 * b_) ** 3;
  const lr =  4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;
  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
};

/** Parse rgb(r g b) or rgb(r, g, b) → [r, g, b] 0–255. */
const parseRgb = (str: string): [number, number, number] | null => {
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]\s*([\d.]+)[,\s]\s*([\d.]+)/i);
  if (!m) return null;
  return [clamp8(parseFloat(m[1])), clamp8(parseFloat(m[2])), clamp8(parseFloat(m[3]))];
};

/** Convert any CSS colour string to a #RRGGBB hex code. */
const colorStringToHex = (color: string): string | null => {
  const s = color.trim();
  let rgb: [number, number, number] | null = null;
  if (s.startsWith("lab("))   rgb = parseLab(s);
  else if (s.startsWith("oklch(")) rgb = parseOklch(s);
  else if (s.startsWith("rgb"))    rgb = parseRgb(s);
  if (!rgb) return null;
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};

/**
 * Resolves a CSS variable to a #RRGGBB hex string.
 * Works with rgb(), lab(), and oklch() computed values — no external library needed.
 */
const resolveColorToHex = (cssVar: string): string => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;pointer-events:none;opacity:0;inset:-9999px;";
  probe.style.backgroundColor = `var(${cssVar})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).backgroundColor;
  probe.remove();

  if (!computed || computed === "transparent") return "#000000";
  return colorStringToHex(computed) ?? computed;
};

const colorSections = [
  {
    title: "Primary Theme Colors",
    items: [
      { label: "Background", cssVar: "--background" },
      { label: "Foreground", cssVar: "--foreground" },
      { label: "Primary", cssVar: "--primary" },
      { label: "Primary Foreground", cssVar: "--primary-foreground" },
    ],
  },
  {
    title: "Secondary & Accent Colors",
    items: [
      { label: "Secondary", cssVar: "--secondary" },
      { label: "Secondary Foreground", cssVar: "--secondary-foreground" },
      { label: "Accent", cssVar: "--accent" },
      { label: "Accent Foreground", cssVar: "--accent-foreground" },
    ],
  },
  {
    title: "UI Component Colors",
    items: [
      { label: "Card", cssVar: "--card" },
      { label: "Card Foreground", cssVar: "--card-foreground" },
      { label: "Popover", cssVar: "--popover" },
      { label: "Popover Foreground", cssVar: "--popover-foreground" },
      { label: "Muted", cssVar: "--muted" },
      { label: "Muted Foreground", cssVar: "--muted-foreground" },
    ],
  },
  {
    title: "Utility & Form Colors",
    items: [
      { label: "Border", cssVar: "--border" },
      { label: "Input", cssVar: "--input" },
      { label: "Ring", cssVar: "--ring" },
    ],
  },
  {
    title: "Status & Feedback Colors",
    items: [
      { label: "Destructive", cssVar: "--destructive" },
      { label: "Destructive Foreground", cssVar: "--destructive-foreground" },
    ],
  },
];

let slideCounter = 4; // starts after the 3 default slides

const createSlide = (): HeroSlide => {
  const id = `hero-${slideCounter++}`;
  const index = slideCounter - 1;
  return { id, label: `Hero Slide ${index}`, imageUrl: null };
};

const Page = () => {
  const { resolvedTheme } = useTheme();
  const [lightLogoUrl, setLightLogoUrl] = useState<string | null>(null);
  const [darkLogoUrl, setDarkLogoUrl] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { id: "hero-1", label: "Hero Slide 1", imageUrl: null },
    { id: "hero-2", label: "Hero Slide 2", imageUrl: null },
    { id: "hero-3", label: "Hero Slide 3", imageUrl: null },
  ]);
  const heroSlideUrlsRef = useRef<string[]>([]);
  const [themePresetName, setThemePresetName] = useState(() => {
    const presetId = readStoredThemePresetId() ?? "seminary-default";
    return getThemePresetById(presetId)?.name ?? "Seminary Default";
  });
  const [themeColorValues, setThemeColorValues] = useState<Record<string, string>>({});
  const [activePresetId, setActivePresetId] = useState<string | null>(
    () => readStoredThemePresetId() ?? "seminary-default",
  );

  // Apply a tweakcn preset by injecting its CSS variables onto :root
  const handleApplyPreset = (preset: TweakcnPreset) => {
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    applyThemePresetById(preset.id, mode);
    saveThemePresetId(preset.id);
    setActivePresetId(preset.id);
    setThemePresetName(preset.name);
  };

  const handleLightLogoChange = (file: File | null) => {
    setLightLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleDarkLogoChange = (file: File | null) => {
    setDarkLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleHeroSlideChange = (slideId: string, file: File | null) => {
    setHeroSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== slideId) return slide;
        if (slide.imageUrl) URL.revokeObjectURL(slide.imageUrl);
        return {
          ...slide,
          imageUrl: file ? URL.createObjectURL(file) : null,
        };
      }),
    );
  };

  const handleAddSlide = () => {
    setHeroSlides((prev) => [...prev, createSlide()]);
  };

  const handleRemoveSlide = (slideId: string) => {
    setHeroSlides((prev) => {
      const slide = prev.find((s) => s.id === slideId);
      if (slide?.imageUrl) URL.revokeObjectURL(slide.imageUrl);
      return prev.filter((s) => s.id !== slideId);
    });
  };

  useEffect(() => {
    heroSlideUrlsRef.current = heroSlides
      .map((slide) => slide.imageUrl)
      .filter((url): url is string => Boolean(url));
  }, [heroSlides]);

  useEffect(
    () => () => {
      if (lightLogoUrl) URL.revokeObjectURL(lightLogoUrl);
      if (darkLogoUrl) URL.revokeObjectURL(darkLogoUrl);
    },
    [lightLogoUrl, darkLogoUrl],
  );

  useEffect(
    () => () => {
      heroSlideUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  useEffect(() => {
    const refreshThemeColorValues = () => {
      const nextValues: Record<string, string> = {};
      colorSections.forEach((section) => {
        section.items.forEach((item: ThemeColorToken) => {
          nextValues[item.cssVar] = resolveColorToHex(item.cssVar);
        });
      });
      setThemeColorValues(nextValues);
    };

    refreshThemeColorValues();

    const observer = new MutationObserver(() => {
      refreshThemeColorValues();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <Heading
        title="Branding"
        description="Manage visual identity assets including logos, homepage hero carousel images, and theme color tokens."
      />

      <div className="space-y-10 mt-10">
        <LogoUploadCard
          lightLogoUrl={lightLogoUrl}
          darkLogoUrl={darkLogoUrl}
          onLightLogoChange={handleLightLogoChange}
          onDarkLogoChange={handleDarkLogoChange}
        />

        {/* Hero Carousel Images */}
        <Card className="bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hero Carousel Images</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {heroSlides.length} slide{heroSlides.length !== 1 ? "s" : ""} configured
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddSlide}
              className="gap-1.5 shrink-0"
            >
              <IconPlus className="size-4" />
              Add Slide
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {heroSlides.length === 0 && (
              <div className="border border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-3 text-center">
                <IconPhotoPlus className="size-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">No slides yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click Add Slide to start building your hero carousel.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSlide}
                  className="gap-1.5 mt-1"
                >
                  <IconPlus className="size-4" />
                  Add First Slide
                </Button>
              </div>
            )}

            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="border rounded-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                {/* Drag handle + label */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <IconGripVertical className="size-4 text-muted-foreground mt-0.5 shrink-0 cursor-grab" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium">{slide.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Slide {index + 1} | Recommended: 1920 x 800 JPG or PNG
                    </p>
                  </div>
                </div>

                {/* Image preview */}
                <div className="w-full md:w-[320px] shrink-0">
                  <div className="relative w-full aspect-[12/5] rounded-md border bg-muted/30 overflow-hidden">
                    {slide.imageUrl ? (
                      <Image
                        src={slide.imageUrl}
                        alt={`${slide.label} preview`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleHeroSlideChange(slide.id, e.target.files?.[0] ?? null)
                      }
                    />
                    <Button variant="outline" size="xs" asChild>
                      <span>
                        <IconPhotoPlus className="size-3.5" />
                        Upload
                      </span>
                    </Button>
                  </label>

                  {slide.imageUrl && (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => handleHeroSlideChange(slide.id, null)}
                    >
                      Remove
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveSlide(slide.id)}
                    disabled={heroSlides.length === 1}
                    title={heroSlides.length === 1 ? "At least one slide is required" : "Delete slide"}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {heroSlides.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSlide}
                className="w-full gap-1.5 border-dashed"
              >
                <IconPlus className="size-4" />
                Add Another Slide
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Theme Presets (tweakcn) */}
        <ThemePresetPicker
          activePresetId={activePresetId}
          onApply={handleApplyPreset}
        />

        {/* Theme Colors */}
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-sm space-y-2">
              <Label htmlFor="theme-preset-name">Theme Preset Name</Label>
              <Input
                id="theme-preset-name"
                value={themePresetName}
                onChange={(e) => setThemePresetName(e.target.value)}
                placeholder="Enter theme preset name"
              />
            </div>

            <div className="space-y-6">
              {colorSections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {section.items.map((color) => (
                      <div
                        key={`${section.title}-${color.label}`}
                        className="border rounded-lg p-3 flex items-center gap-3"
                      >
                        <span
                          className="size-12 rounded-xl border shrink-0"
                          style={{ backgroundColor: `var(${color.cssVar})` }}
                          aria-hidden="true"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-medium">{color.label}</p>
                          <p className="text-xs text-muted-foreground uppercase font-mono tracking-wide">
                            {themeColorValues[color.cssVar] ?? "..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
