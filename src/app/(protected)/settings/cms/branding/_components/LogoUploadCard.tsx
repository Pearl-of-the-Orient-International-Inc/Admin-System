"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconPhotoPlus } from "@tabler/icons-react";
import { useRef } from "react";

type LogoUploadCardProps = {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  onLightLogoChange?: (file: File | null) => void;
  onDarkLogoChange?: (file: File | null) => void;
};

export const LogoUploadCard = ({
  lightLogoUrl,
  darkLogoUrl,
  onLightLogoChange,
  onDarkLogoChange,
}: LogoUploadCardProps) => {
  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const handleLightClick = () => lightInputRef.current?.click();
  const handleDarkClick = () => darkInputRef.current?.click();

  const handleLightFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onLightLogoChange?.(file ?? null);
    e.target.value = "";
  };

  const handleDarkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onDarkLogoChange?.(file ?? null);
    e.target.value = "";
  };

  return (
    <div>
      <p>Logos</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-8">
          {/* Light logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-13">
                <AvatarImage src={lightLogoUrl ?? "/main/logo.png"} alt="Light logo" />
                <AvatarFallback>
                  LM
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-sm">Light logo</h3>
                <p className="text-muted-foreground text-xs">
                  Used on light backgrounds. Prefer 132px square or larger.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={lightInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLightFile}
              />
              <Button variant="outline" size="xs" onClick={handleLightClick}>
                <IconPhotoPlus className="size-3.5" />
                Upload a new photo
              </Button>
            </div>
          </div>

          {/* Dark logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-13">
                <AvatarImage src={darkLogoUrl ?? "/main/logo.png"} alt="Dark logo" />
                <AvatarFallback>
                  DM
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-sm">Dark logo</h3>
                <p className="text-muted-foreground text-xs">
                  Used on dark backgrounds. Prefer 132px square or larger.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={darkInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDarkFile}
              />
              <Button variant="outline" size="xs" onClick={handleDarkClick}>
                <IconPhotoPlus className="size-3.5" />
                Upload a new photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
