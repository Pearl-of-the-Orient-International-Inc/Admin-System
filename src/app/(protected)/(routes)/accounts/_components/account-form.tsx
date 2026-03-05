/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GalleryThumbnailsIcon, Save, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UserPosition, UserType } from "@/enums";
import { toApiError } from "@/features/auth/auth.hooks";
import {
  useAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
} from "@/features/accounts/account.hooks";
import { accountPositionOptions } from "./accounts-data";

type AccountFormMode = "create" | "update";

type AccountFormProps = {
  mode: AccountFormMode;
  accountId?: string;
};

type AccountFormState = {
  fullName: string;
  email: string;
  avatar?: string;
  role: UserType.ADMIN;
  position: UserPosition;
  password: string;
};

const emptyForm: AccountFormState = {
  fullName: "",
  email: "",
  role: UserType.ADMIN,
  position: UserPosition.CLERK,
  password: "",
};

const generateTemporaryPassword = (length = 12): string => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()-_=+";
  const allChars = `${uppercase}${lowercase}${numbers}${symbols}`;

  const pick = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)] ?? "";

  const seeded = [
    pick(uppercase),
    pick(lowercase),
    pick(numbers),
    pick(symbols),
  ];

  while (seeded.length < length) {
    seeded.push(pick(allChars));
  }

  return seeded.sort(() => Math.random() - 0.5).join("");
};

export function AccountForm({ mode, accountId }: AccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const createAccountMutation = useCreateAccountMutation();
  const updateAccountMutation = useUpdateAccountMutation();
  const accountQuery = useAccountByIdQuery(accountId ?? "", mode === "update");

  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(
    undefined,
  );
  const [form, setForm] = useState<AccountFormState>(emptyForm);

  const hasAvatar = Boolean(avatarPreviewUrl);
  const isSubmitting =
    createAccountMutation.isPending || updateAccountMutation.isPending;

  const setField = <K extends keyof AccountFormState>(
    key: K,
    value: AccountFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (mode !== "create") return;
    if (form.password) return;
    setField("password", generateTemporaryPassword());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "update" || !accountQuery.data) return;

    setForm({
      fullName: accountQuery.data.name,
      email: accountQuery.data.email,
      avatar: accountQuery.data.avatar ?? undefined,
      role: UserType.ADMIN,
      position: accountQuery.data.position ?? UserPosition.CLERK,
      password: "",
    });
    setAvatarPreviewUrl(accountQuery.data.avatar ?? undefined);
  }, [accountQuery.data, mode]);

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
    };
  }, [objectPreviewUrl]);

  const isInvalid = useMemo(() => {
    const hasBasicFields = form.fullName.trim() && form.email.trim();
    if (!hasBasicFields) return true;
    if (mode === "create" && !form.password.trim()) return true;
    return false;
  }, [form, mode]);

  const handleOpenAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "image/svg+xml";

    if (!isValidType) {
      toast({
        title: "Invalid file format",
        description: "Please upload JPG, PNG, WEBP, or SVG image files only.",
        variant: "error",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum avatar size is 2MB.",
        variant: "error",
      });
      return;
    }

    setIsAvatarUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);

    const previewUrl = URL.createObjectURL(file);
    setObjectPreviewUrl(previewUrl);
    setAvatarPreviewUrl(previewUrl);
    setField("avatar", previewUrl);
    setIsAvatarUploading(false);

    toast({
      title: "Avatar selected",
      description: "Avatar preview updated. Save changes to apply.",
      variant: "success",
    });
  };

  const handleRemoveAvatar = () => {
    if (objectPreviewUrl) {
      URL.revokeObjectURL(objectPreviewUrl);
      setObjectPreviewUrl(null);
    }

    setAvatarPreviewUrl(undefined);
    setField("avatar", undefined);

    toast({
      title: "Avatar removed",
      description: "Avatar will be removed after saving this form.",
      variant: "info",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAvatar =
      form.avatar && !form.avatar.startsWith("blob:") ? form.avatar : null;

    try {
      if (mode === "create") {
        await createAccountMutation.mutateAsync({
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: UserType.ADMIN,
          position: form.position,
          avatar: normalizedAvatar,
        });

        toast({
          variant: "success",
          title: "Account created",
          description: "The account has been registered successfully.",
        });
      } else {
        if (!accountId) return;

        await updateAccountMutation.mutateAsync({
          userId: accountId,
          payload: {
            name: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            role: UserType.ADMIN,
            position: form.position,
            avatar: normalizedAvatar,
          },
        });

        toast({
          variant: "success",
          title: "Account updated",
          description: "Account changes have been saved successfully.",
        });
      }

      router.push("/accounts");
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description: apiError.message ?? "Unable to save account details right now.",
        variant: "error",
      });
    }
  };

  if (mode === "update" && accountQuery.isLoading) {
    return (
      <section className="space-y-5 p-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </section>
    );
  }

  return (
    <section className="space-y-5 p-10">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/accounts">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create Account" : "Update Account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Register a new admin account."
              : "Update account position, status, and security preferences."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 relative space-y-5">
        <input
          ref={avatarInputRef}
          type="file"
          accept=".jpg,.png,.jpeg,.webp,.svg"
          name="avatar"
          className="sr-only"
          onChange={handleAvatarChange}
        />

        <div className="relative min-h-9 isolate">
          {!hasAvatar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="absolute top-0.5 left-0.5 overflow-hidden"
                  onClick={handleOpenAvatarPicker}
                  disabled={isAvatarUploading}
                >
                  <span className="inline-flex items-center gap-2">
                    <GalleryThumbnailsIcon />
                    {isAvatarUploading
                      ? "Uploading..."
                      : "Add an avatar picture..."}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Maximum avatar size is 2MB <br />
                Format should be JPG, PNG, WEBP or SVG
              </TooltipContent>
            </Tooltip>
          )}

          {hasAvatar && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 left-2 z-30 rounded-full"
              onClick={handleRemoveAvatar}
            >
              <XIcon />
            </Button>
          )}

          <div>
            <AnimatePresence mode="wait">
              {hasAvatar && (
                <motion.figure
                  key="avatar-preview"
                  className="size-36 md:size-44 rounded-full overflow-hidden border-2 border-border/80 shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    visualDuration: 0.25,
                    bounce: 0.2,
                  }}
                >
                  <img
                    src={avatarPreviewUrl}
                    alt={form.fullName || "Account avatar"}
                    className="size-full object-cover"
                  />
                </motion.figure>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Textarea
          name="fullName"
          id="fullName"
          maxLength={180}
          className="text-4xl! font-semibold tracking-tight border-none ring-0! bg-transparent! px-0 resize-none shadow-none"
          placeholder="e.g. Juan Dela Cruz"
          onChange={(event) => setField("fullName", event.target.value)}
          value={form.fullName}
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan.delacruz@gmail.com"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value="ADMIN" readOnly />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={form.position}
              onValueChange={(value) =>
                setField("position", value as UserPosition)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountPositionOptions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position.replace("_", "/")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {mode === "create" && (
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <div className="flex items-center gap-2">
              <Input id="password" type="text" disabled value={form.password} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setField("password", generateTemporaryPassword())}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This password will be sent to the user via email after registration.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 sticky bottom-0 py-4 bg-background isolate after:absolute after:bottom-full after:w-full after:h-10 after:bg-linear-to-t after:from-background after:to-transparent after:-z-10 after:pointer-events-none">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/accounts")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isInvalid || isSubmitting}>
            <Save className="size-4" />
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Account"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
