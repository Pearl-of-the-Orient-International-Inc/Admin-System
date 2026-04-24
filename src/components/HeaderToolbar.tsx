"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  CornerDownLeftIcon,
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
import { adminSearchItems } from "@/lib/admin-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export const HeaderToolbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const searchGroups = useMemo(() => {
    return adminSearchItems.reduce<Record<string, typeof adminSearchItems>>(
      (groups, item) => {
        groups[item.section] ??= [];
        groups[item.section].push(item);
        return groups;
      },
      {},
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectSearchItem = (url: string) => {
    setIsSearchOpen(false);
    router.push(url);
  };

  return (
    <>
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
          onClick={() => setIsSearchOpen(true)}
          aria-label="Open global search"
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

      <CommandDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        title="Search Admin"
        description="Search across the admin workspace."
        className="max-w-2xl"
      >
        <CommandInput placeholder="Search pages, reports, settings, tools..." />
        <CommandList className="max-h-105">
          <CommandEmpty>No admin pages matched your search.</CommandEmpty>
          {Object.entries(searchGroups).map(([section, items], index) => (
            <div key={section}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={section}>
                {items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <CommandItem
                      key={item.url}
                      value={`${item.title} ${item.description} ${item.section} ${item.keywords.join(" ")} ${item.url}`}
                      onSelect={() => handleSelectSearchItem(item.url)}
                    >
                      <Icon className="size-4" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {item.description}
                        </p>
                      </div>
                      <CommandShortcut className="flex items-center gap-1 normal-case tracking-normal">
                        <CornerDownLeftIcon className="size-3.5" />
                        {item.url}
                      </CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
