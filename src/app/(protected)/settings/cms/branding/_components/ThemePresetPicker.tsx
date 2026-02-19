"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconExternalLink, IconPalette } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { TWEAKCN_PRESETS, type TweakcnPreset } from "@/constants/theme-presets";

// The 5 most visually distinctive CSS vars to use as a swatch preview
const SWATCH_VARS = [
  "--background",
  "--primary",
  "--secondary",
  "--accent",
  "--foreground",
] as const;

type Props = {
  /** The id of the currently active preset (or null for custom) */
  activePresetId: string | null;
  /** Called when the user clicks Apply on a preset */
  onApply: (preset: TweakcnPreset) => void;
};

export function ThemePresetPicker({ activePresetId, onApply }: Props) {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconPalette className="size-5" />
              Theme Presets
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a starting point from{" "}
              <a
                href="https://tweakcn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors inline-flex items-center gap-0.5"
              >
                tweakcn
                <IconExternalLink className="size-3" />
              </a>
              . Applying a preset overwrites all theme color variables.
            </p>
          </div>
          {activePresetId && activePresetId !== "custom" && (
            <Badge variant="secondary" className="shrink-0 mt-0.5">
              {TWEAKCN_PRESETS.find((p) => p.id === activePresetId)?.name ?? activePresetId}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TWEAKCN_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApply(preset)}
                className={cn(
                  "group relative flex flex-col gap-2.5 rounded-xl border p-3 text-left transition-all duration-150",
                  "hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                    : "border-border bg-card",
                )}
                title={preset.description}
              >
                {/* Color swatches */}
                <div className="flex gap-1 rounded-lg overflow-hidden h-8">
                  {SWATCH_VARS.map((cssVar) => (
                    <span
                      key={cssVar}
                      className="flex-1 rounded-sm"
                      style={{ backgroundColor: preset.light[cssVar] }}
                    />
                  ))}
                </div>

                {/* Dark mode peek */}
                <div className="flex gap-1 rounded-lg overflow-hidden h-4 opacity-60">
                  {SWATCH_VARS.map((cssVar) => (
                    <span
                      key={cssVar}
                      className="flex-1 rounded-sm"
                      style={{ backgroundColor: preset.dark[cssVar] }}
                    />
                  ))}
                </div>

                {/* Name + check */}
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="text-xs font-medium leading-tight truncate">
                    {preset.name}
                  </span>
                  {isActive && (
                    <IconCheck className="size-3.5 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Light row shown on top | Dark row shown below | Applying saves your preset and keeps it after refresh.
        </p>
      </CardContent>
    </Card>
  );
}

