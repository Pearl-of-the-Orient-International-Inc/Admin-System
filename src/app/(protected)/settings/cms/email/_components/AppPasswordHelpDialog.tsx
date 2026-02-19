/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconHelpCircle,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import { ImageZoom } from "@/components/ImageZoom";
import Image from "next/image";
import { cn } from "@/lib/utils";

type StepConfig = {
  step: number;
  title: string;
  description: React.ReactNode;
  image: string | null;
};

const STEPS: StepConfig[] = [
  {
    step: 1,
    title: "Go to Google Account",
    description: (
      <>
        Open{" "}
        <a
          href="https://myaccount.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          https://myaccount.google.com/
        </a>{" "}
        and sign in if needed.
      </>
    ),
    image: null,
  },
  {
    step: 2,
    title: "Open Security & sign-in",
    description: (
      <>
        In the left sidebar, click <strong>Security & sign-in</strong> (lock
        icon).
      </>
    ),
    image: "/app-password-steps/1.png",
  },
  {
    step: 3,
    title: "Turn on 2-Step Verification",
    description: (
      <>
        Under "How you sign in to Google", find{" "}
        <strong>2-Step Verification</strong> and turn it on. You must complete
        this before App passwords are available.
      </>
    ),
    image: "/app-password-steps/2.png",
  },
  {
    step: 4,
    title: "Open App passwords",
    description: (
      <>
        Use the search bar at the top to search <strong>App passwords</strong>,
        then click the "App passwords" result under Security.
      </>
    ),
    image: "/app-password-steps/3.png",
  },
  {
    step: 5,
    title: "Create a new app password",
    description:
      'On the App passwords page, enter a name for this app (e.g. "Pearl of the Orient"), then create the password.',
    image: "/app-password-steps/4.png",
  },
  {
    step: 6,
    title: "Copy the app password",
    description:
      "A 16-character password will appear in a popup. Copy it and paste it into the App password field above. You won't be able to see it again in Google.",
    image: "/app-password-steps/5.png",
  },
];

const TOTAL_STEPS = STEPS.length;

export const AppPasswordHelpDialog = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const step = STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TOTAL_STEPS - 1;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setCurrentIndex(0);
      setIsImageZoomed(false);
    }
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (isImageZoomed) {
      e.preventDefault();
      setIsImageZoomed(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (isLast) setOpen(false);
    else setCurrentIndex((i) => i + 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="How to get a Gmail app password"
        >
          <IconHelpCircle className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[90vh] max-w-lg flex-col sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle>How to get a Gmail app password</DialogTitle>
          <p className="text-muted-foreground text-xs">
            Step {step.step} of {TOTAL_STEPS}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <div className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-muted-foreground">
              {step.step}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-medium">{step.title}</p>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
              {step.image && (
                <div className="mt-2">
                  <ImageZoom
                    isZoomed={isImageZoomed}
                    onZoomChange={setIsImageZoomed}
                    zoomMargin={100}
                    backdropClassName={cn(
                      '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80',
                    )}
                  >
                    <Image
                      alt={`Step ${step.step} screenshot`}
                      className="h-auto w-96"
                      height={800}
                      src={step.image}
                      unoptimized
                      width={1200}
                    />
                  </ImageZoom>
                  <p className="text-muted-foreground text-xs mt-2">
                    Tip: Press <span className="font-medium">Esc</span> to zoom
                    out.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirst}
          >
            <IconArrowLeft className="size-4" />
            Previous
          </Button>
          <Button type="button" size="sm" onClick={handleNext}>
            {isLast ? "Done" : "Next"}
            {!isLast && <IconArrowRight className="size-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
