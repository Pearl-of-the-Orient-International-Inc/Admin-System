"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ActivityIcon,
  BookOpenIcon,
  ChevronDownIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { IconBellBolt, IconSearch } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCurrentUserQuery, useLogoutMutation, toApiError } from "@/features/auth/auth.hooks";
import { useToast } from "@/hooks/use-toast";

export const HeaderToolbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Signed out",
        description: "Your session has been closed.",
        variant: "info"
      });
      router.replace("/");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: "Sign out failed",
        description: apiError.message ?? "Unable to sign out right now.",
        variant: "error",
      });
    }
  };

  const emailUsername =
    currentUser?.email?.split("@")[0]?.trim() || "account";

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="font-medium hover:text-foreground py-4.5"
            size="sm"
          >
            <Image
              src="/main/logo.png"
              alt="Pearl of the Orient"
              width={20}
              height={20}
            />
            {isCurrentUserLoading ? (
              <Skeleton className="h-4 w-24 rounded-sm" />
            ) : (
              <>
                {emailUsername}{" "}
                <ChevronDownIcon className="size-3.5 text-muted-foreground ml-auto" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-55">
          <DropdownMenuGroup className='space-y-1'>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <SettingsIcon className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpenIcon className="size-4" />
              Docs
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className='space-y-1'>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PaletteIcon />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className='w-40' sideOffset={6}>
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={setTheme}
                      className='space-y-1'
                    >
                      <DropdownMenuRadioItem value="light">
                        <SunIcon />
                        Light
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <MoonIcon />
                        Dark
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        <MonitorIcon />
                        System
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className='space-y-1'>
            <DropdownMenuItem onClick={() => router.push(`/system-logs/${currentUser?.id}`)}>
              <ActivityIcon className="size-4" />
              Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              <LogOutIcon className="size-4" />
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full hover:text-foreground"
      >
        <IconSearch className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full hover:text-foreground"
      >
        <IconBellBolt className="size-4" />
      </Button>
    </div>
  );
};
