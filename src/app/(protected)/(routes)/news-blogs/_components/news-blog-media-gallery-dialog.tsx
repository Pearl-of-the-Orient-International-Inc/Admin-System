"use client";

import { useEffect, useState } from "react";
import { Film, ImageIcon } from "lucide-react";

import type { NewsBlogRecord } from "@/features/news-blogs/news-blog.types";
import { Badge } from "@/components/ui/badge";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function NewsBlogMediaGalleryDialog({
  post,
  open,
  onOpenChange,
}: {
  post: NewsBlogRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const media = post?.media ?? [];

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(0);
    }
  }, [open, post?.id]);

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    if (carouselApi.selectedScrollSnap() !== activeIndex) {
      carouselApi.scrollTo(activeIndex);
    }
  }, [activeIndex, carouselApi]);

  const activeItem = media[activeIndex] ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl! border-none gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Post Media Gallery</DialogTitle>
          <DialogDescription>
            {post?.title ?? "Selected post"} has {media.length} media asset
            {media.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-[80vh] gap-0 md:grid-cols-[1fr_280px]">
          <div className="flex min-h-0 items-center justify-center bg-black px-16 py-8">
            {activeItem ? (
              <Carousel
                setApi={setCarouselApi}
                opts={{ startIndex: activeIndex }}
                className="w-full max-w-3xl"
              >
                <CarouselContent>
                  {media.map((item) => (
                    <CarouselItem key={item.id}>
                      <div className="flex h-[60vh] items-center justify-center">
                        {item.kind === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.previewUrl}
                            alt={item.fileName}
                            className="max-h-full max-w-full rounded-xl object-contain"
                          />
                        ) : (
                          <video
                            src={item.previewUrl}
                            controls
                            className="max-h-full max-w-full rounded-xl"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {media.length > 1 ? (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                ) : null}
              </Carousel>
            ) : (
              <p className="text-sm text-white/70">No media attached.</p>
            )}
          </div>

          <div className="border-l bg-background">
            <div className="space-y-2 border-b px-4 py-4">
              
              <p className="text-sm font-medium truncate">
                {activeItem ? activeItem.fileName : "No asset selected"}
              </p>
              <p className="text-muted-foreground text-xs">
                {activeItem
                  ? `Asset ${activeIndex + 1} of ${media.length}`
                  : "Choose a media asset to preview it here."}
              </p>
            </div>

            <ScrollArea className="h-[calc(70vh-96px)]">
              <div className="grid gap-3 p-4">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "overflow-hidden rounded-xl border text-left transition",
                      activeIndex === index
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border/60 hover:border-primary/40",
                    )}
                  >
                    <div className="relative aspect-auto bg-black/5">
                      {item.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewUrl}
                          alt={item.fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.previewUrl}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.fileName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.kind === "image" ? "Image asset" : "Video asset"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.kind === "video" ? (
                          <Film className="size-3.5" />
                        ) : (
                          <ImageIcon className="size-3.5" />
                        )}
                        {item.kind}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
