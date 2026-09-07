"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  customMemoTemplateSuggestions,
  generalOfficeTemplateOptions,
  memoTemplateOptions,
  type GeneralOfficeTemplateVariant,
  type MemoTemplateType,
} from "./memo-announcements-data";

type MemoTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemoTemplateDialog({
  open,
  onOpenChange,
}: MemoTemplateDialogProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] =
    useState<MemoTemplateType>("ANNOUNCEMENT");
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [generalOfficeTemplate, setGeneralOfficeTemplate] =
    useState<GeneralOfficeTemplateVariant>("OFFICE_MEMORANDUM");

  const requiresCustomTemplate = selectedTemplate === "BLANK";
  const normalizedCustomTemplateName = customTemplateName.trim();

  const isContinueDisabled =
    requiresCustomTemplate && normalizedCustomTemplateName.length === 0;

  const selectedTemplateDetails = useMemo(
    () =>
      memoTemplateOptions.find((option) => option.value === selectedTemplate) ??
      memoTemplateOptions[0],
    [selectedTemplate],
  );

  const handleContinue = () => {
    if (isContinueDisabled) {
      return;
    }

    const searchParams = new URLSearchParams({
      type: selectedTemplate,
    });

    if (selectedTemplate === "GENERAL_OFFICE") {
      searchParams.set("variant", generalOfficeTemplate);
    }

    if (requiresCustomTemplate && normalizedCustomTemplateName) {
      searchParams.set("type", normalizedCustomTemplateName);
    }

    onOpenChange(false);
    router.push(`/memo-editor/create?${searchParams.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! rounded-2xl! gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                What type of template would you like to create?
              </DialogTitle>
              <DialogDescription className="max-w-3xl text-sm!">
                Start from one of the six memo templates below. Blank Template
                lets you define a more specific memo type before opening the
                editor.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {memoTemplateOptions.map((option) => {
              const isSelected = option.value === selectedTemplate;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedTemplate(option.value)}
                  className={cn(
                    "group relative flex min-h-40 flex-col items-center justify-center rounded-2xl border bg-card px-4 py-3 text-center transition-all hover:border-primary/50 hover:shadow-sm",
                    isSelected &&
                      "border-primary ring-primary/15 shadow-sm ring-4",
                  )}
                >
                  {isSelected ? (
                    <span className="bg-primary text-primary-foreground absolute right-4 top-4 inline-flex size-5 items-center justify-center rounded-full">
                      <Check className="size-3" />
                    </span>
                  ) : null}

                  <div className="relative">
                    <Image
                      src={option.iconSrc}
                      alt={option.title}
                      width={48}
                      height={48}
                      className="size-13 object-contain"
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold">{option.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTemplate === "GENERAL_OFFICE" ? (
            <div className="space-y-3 rounded-2xl border bg-accent/20 p-4">
              <div>
                <p className="text-sm font-medium">
                  Choose a General Office document
                </p>
                <p className="text-muted-foreground text-xs">
                  Select the office memorandum or one of the formal letter
                  templates.
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {generalOfficeTemplateOptions.map((option) => {
                  const isSelected = option.value === generalOfficeTemplate;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGeneralOfficeTemplate(option.value)}
                      className={cn(
                        "relative rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary/50",
                        isSelected && "border-primary ring-primary/15 ring-2",
                      )}
                    >
                      {isSelected ? (
                        <span className="bg-primary text-primary-foreground absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                      <p className="pr-7 text-sm font-semibold">
                        {option.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : requiresCustomTemplate ? (
            <div className="rounded-2xl border bg-accent/20 p-3">
              <div className="space-y-2">
                <Label
                  htmlFor="custom-template-name"
                  className="text-xs font-medium"
                >
                  Specify the memo type for Blank Template
                </Label>
                <Input
                  id="custom-template-name"
                  value={customTemplateName}
                  onChange={(event) =>
                    setCustomTemplateName(event.target.value)
                  }
                  className="h-8.5"
                  placeholder="Example: Personnel / HR"
                />
                <p className="text-muted-foreground text-xs">
                  Use a custom label such as Personnel / HR, Budget Request, or
                  Chaplaincy Advisory.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {customMemoTemplateSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setCustomTemplateName(suggestion)}
                    className="text-muted-foreground hover:text-foreground rounded-full border bg-background px-2 py-1 text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-accent/20 p-3">
              <p className="text-sm font-medium">
                {selectedTemplateDetails.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {selectedTemplateDetails.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleContinue}
            disabled={isContinueDisabled}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
