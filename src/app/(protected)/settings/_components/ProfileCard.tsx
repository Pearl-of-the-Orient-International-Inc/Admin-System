"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconPhotoPlus } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";

const toAvatarUrl = (avatar: string | null | undefined): string | undefined => {
  if (!avatar) return undefined;

  const trimmedAvatar = avatar.trim();
  if (!trimmedAvatar) return undefined;

  if (
    trimmedAvatar.startsWith("http://") ||
    trimmedAvatar.startsWith("https://") ||
    trimmedAvatar.startsWith("data:") ||
    trimmedAvatar.startsWith("blob:")
  ) {
    return trimmedAvatar;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL_DEV ||
    process.env.NEXT_PUBLIC_API_BASE_URL_PROD;

  if (!apiBaseUrl) return trimmedAvatar;

  try {
    const apiOrigin = new URL(apiBaseUrl).origin;
    return `${apiOrigin}${trimmedAvatar.startsWith("/") ? "" : "/"}${trimmedAvatar}`;
  } catch {
    return trimmedAvatar;
  }
};

export const ProfileCard = () => {
  const { data: currentUser } = useCurrentUserQuery();

  const fullName = currentUser?.name?.trim() || "Unknown User";
  const avatarUrl = toAvatarUrl(currentUser?.avatar);
  const fallbackSeed = currentUser?.name || currentUser?.email || "U";
  const initials = fallbackSeed
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div>
      <p>Your profile</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-13">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-sm">Profile Picture</h3>
                <p className="text-muted-foreground text-xs">
                  Use a photo or image that is 132px square or larger.
                </p>
              </div>
            </div>
            <Button size="xs" variant="outline">
              <IconPhotoPlus className="size-3.5" />
              Upload a new photo
            </Button>
          </div>
          <div className="mt-7">
            <p className="text-sm">Full name</p>
            <p className="text-muted-foreground text-xs mb-2 mt-1.5">
              Use your full name, preferred name, or a nickname...
            </p>
            <Input value={fullName} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
