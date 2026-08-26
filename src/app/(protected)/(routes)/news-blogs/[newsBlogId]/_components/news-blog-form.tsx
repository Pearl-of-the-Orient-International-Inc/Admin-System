"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronsUpDownIcon,
  Film,
  Globe,
  Hash,
  ImageIcon,
  Mail,
  MessageCircle,
  MapPin,
  MoreHorizontal,
  Newspaper,
  Save,
  Star,
  Tag,
  ThumbsUp,
  Upload,
  UserPlus,
  X,
  Camera,
} from "lucide-react";

import { MemberStatus } from "@/enums";
import {
  useCreateNewsBlogMutation,
  useNewsBlogByIdQuery,
  useUpdateNewsBlogMutation,
  useUploadNewsBlogMediaMutation,
} from "@/features/news-blogs/news-blog.hooks";
import { syncNewsBlogToFacebook } from "@/features/news-blogs/news-blog.api";
import type { NewsBlogRecord } from "@/features/news-blogs/news-blog.types";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";
import { useMembersQuery } from "@/features/members/member.hooks";
import { toApiError } from "@/lib/http-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Safari } from "@/components/Safari";
import { SummaryStatCard } from "@/components/SummaryStatCard";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import Image from "next/image";

import { FaBell, FaFacebookMessenger } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import { MdFaceRetouchingNatural, MdOutlineGifBox } from "react-icons/md";
import { LuSticker } from "react-icons/lu";
import { EmojiReaction } from "./emoji-reaction";

type NewsBlogFormMode = "create" | "update";
type NewsBlogFormMediaItem = NewsBlogRecord["media"][number] & {
  file?: File | null;
};

const surfaceClass =
  "border-border/60 bg-accent/30 text-foreground shadow-none backdrop-blur-sm";
const fieldClass =
  "border-border/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30";

export function NewsBlogForm({
  mode,
  initialPost,
  newsBlogId,
}: {
  mode: NewsBlogFormMode;
  initialPost?: NewsBlogRecord | null;
  newsBlogId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUserQuery();
  const newsBlogQuery = useNewsBlogByIdQuery(
    newsBlogId ?? "",
    mode === "update",
  );
  const membersQuery = useMembersQuery({
    limit: 100,
    status: MemberStatus.APPROVED,
  });
  const createNewsBlogMutation = useCreateNewsBlogMutation();
  const updateNewsBlogMutation = useUpdateNewsBlogMutation();
  const uploadNewsBlogMediaMutation = useUploadNewsBlogMediaMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [caption, setCaption] = useState(initialPost?.caption ?? "");
  const [mediaItems, setMediaItems] = useState<NewsBlogFormMediaItem[]>(
    initialPost?.media ?? [],
  );
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(
    initialPost?.hashtags ?? ["#PearlOfTheOrient", "#MinistryUpdate"],
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialPost?.taggedMembers.map((member) => member.id) ?? [],
  );
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [shouldSyncToFacebook, setShouldSyncToFacebook] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [mediaItems]);

  const selectableMembers = useMemo(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data?.data],
  );

  const selectedMembers = useMemo(
    () =>
      selectedMemberIds
        .map((memberId) =>
          selectableMembers.find((member) => member.id === memberId),
        )
        .filter(Boolean),
    [selectableMembers, selectedMemberIds],
  );

  const imageCount = mediaItems.filter((item) => item.kind === "image").length;
  const videoCount = mediaItems.filter((item) => item.kind === "video").length;
  const characterCount = caption.length;
  const isInvalid = !title.trim() || !caption.trim();
  const previewPlainText = getPlainText(caption);
  const previewGallery = mediaItems.filter((item) => item.kind === "image");
  const shouldShowCaptionToggle = previewPlainText.length > 220;
  const currentUserName = currentUser?.name?.trim() || "Current User";
  const currentUserAvatar = toAvatarUrl(currentUser?.avatar);
  const currentUserInitials = getInitials(
    currentUser?.name?.trim() || currentUser?.email || "CU",
  );
  const resolvedInitialPost = newsBlogQuery.data ?? initialPost ?? null;

  useEffect(() => {
    if (!resolvedInitialPost) return;

    setTitle(resolvedInitialPost.title);
    setCaption(resolvedInitialPost.caption);
    setMediaItems(
      resolvedInitialPost.media.map((item) => ({
        ...item,
        file: null,
      })),
    );
    setHashtags(resolvedInitialPost.hashtags);
    setSelectedMemberIds(
      resolvedInitialPost.taggedMembers.map((member) => member.id),
    );
  }, [resolvedInitialPost]);

  if (mode === "update" && !resolvedInitialPost && !newsBlogQuery.isLoading) {
    return (
      <section className="space-y-6 p-10">
        <Card>
          <CardHeader>
            <CardTitle>Post not found</CardTitle>
            <CardDescription>
              We couldn&apos;t load the requested news or blog draft for
              editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/news-blogs">
                <ArrowLeft className="size-4" />
                Back to news & blogs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const nextItems = files
      .filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/"),
      )
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        kind: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        file,
      }));

    setMediaItems((current) => [...current, ...nextItems]);
    event.target.value = "";
  };

  const removeMedia = (itemId: string) => {
    setMediaItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (target?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== itemId);
    });
  };

  const addHashtag = () => {
    const normalized = hashtagInput.trim().replace(/\s+/g, "");
    if (!normalized) return;

    const nextTag = normalized.startsWith("#") ? normalized : `#${normalized}`;

    if (!hashtags.includes(nextTag)) {
      setHashtags((current) => [...current, nextTag]);
    }

    setHashtagInput("");
  };

  const removeHashtag = (value: string) => {
    setHashtags((current) => current.filter((tag) => tag !== value));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const pendingMediaItems = mediaItems.filter((item) => item.file);
      const uploadedMedia = pendingMediaItems.length
        ? await uploadNewsBlogMediaMutation.mutateAsync(
            pendingMediaItems.map((item) => item.file!).filter(Boolean),
          )
        : [];
      const uploadedMediaUrls = uploadedMedia.map(
        (item) => item.serverData?.fileUrl ?? item.ufsUrl ?? item.url,
      );
      let uploadedMediaIndex = 0;

      const payload = {
        title: title.trim(),
        caption,
        media: mediaItems.map((item) => ({
          kind: item.kind === "image" ? ("IMAGE" as const) : ("VIDEO" as const),
          fileUrl: item.file
            ? (uploadedMediaUrls[uploadedMediaIndex++] ?? item.previewUrl)
            : item.previewUrl,
          fileName: item.fileName,
        })),
        taggedMemberIds: selectedMemberIds,
        hashtags,
        facebookPostId: resolvedInitialPost?.facebookPostId ?? null,
        platform: "FACEBOOK" as const,
        status: "PUBLISHED" as const,
        scheduledAt: null,
        publishedAt:
          resolvedInitialPost?.publishedAt ?? new Date().toISOString(),
      };

      let savedNewsBlog: NewsBlogRecord;

      if (mode === "create") {
        savedNewsBlog = await createNewsBlogMutation.mutateAsync(payload);
      } else if (newsBlogId) {
        savedNewsBlog = await updateNewsBlogMutation.mutateAsync({
          id: newsBlogId,
          payload,
        });
      } else {
        throw new Error("News/blog post ID is required for updates.");
      }

      let facebookSyncError: string | null = null;

      if (shouldSyncToFacebook) {
        try {
          const facebookSync = await syncNewsBlogToFacebook({
            action: mode,
            newsBlog: savedNewsBlog,
          });

          if (
            facebookSync?.postId &&
            facebookSync.postId !== savedNewsBlog.facebookPostId
          ) {
            await updateNewsBlogMutation.mutateAsync({
              id: savedNewsBlog.id,
              payload: {
                ...payload,
                facebookPostId: facebookSync.postId,
              },
            });
          }
        } catch (error) {
          facebookSyncError =
            error instanceof Error
              ? error.message
              : "The post was saved, but Facebook sync failed.";
        }
      }

      toast({
        title: mode === "create" ? "Post created" : "Post updated",
        description:
          mode === "create"
            ? shouldSyncToFacebook && !facebookSyncError
              ? "The news/blog post was created and posted to the Facebook Page."
              : "The news/blog post was created successfully."
            : shouldSyncToFacebook && !facebookSyncError
              ? "The news/blog post changes were saved and posted to the Facebook Page."
              : "The news/blog post changes were saved successfully.",
        variant: "success",
      });

      if (facebookSyncError) {
        toast({
          title: "Facebook sync skipped",
          description: facebookSyncError,
          variant: "warning",
        });
      }

      router.push("/news-blogs");
    } catch (error) {
      const fallbackMessage =
        error instanceof Error ? error.message : "Unexpected error";

      toast({
        title: mode === "create" ? "Create failed" : "Update failed",
        description:
          toApiError(error).message ||
          fallbackMessage ||
          "Unable to save the news/blog post right now.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/news-blogs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "create" ? "Create News Post" : "Update News Post"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Facebook-ready composer for title, caption, media, member tags,
              and hashtag sets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
            <Newspaper className="size-4" />
            Open editor
          </Button>
          <Button onClick={handleSubmit} disabled={isInvalid || isSubmitting}>
            <Save className="size-4" />
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create post"
                : "Save changes"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-transparent">
        <CardHeader className="border-b pb-4">
          <CardTitle>Draft Summary</CardTitle>
          <CardDescription>
            Live composition signals for this post draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="Media Assets"
            value={mediaItems.length}
            description={`${imageCount} image${imageCount === 1 ? "" : "s"} and ${videoCount} video${videoCount === 1 ? "" : "s"}`}
            icon={<ImageIcon className="size-4" />}
            accentClassName="bg-blue-700/10 text-blue-700 dark:bg-blue-300/10 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Tagged Members"
            value={selectedMemberIds.length}
            description="Optional profile-linked people for this post"
            icon={<Tag className="size-4" />}
            accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
          />
          <SummaryStatCard
            label="Hashtags"
            value={hashtags.length}
            description="Campaign and discoverability tags"
            icon={<Hash className="size-4" />}
            accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
          />
          <SummaryStatCard
            label="Caption Length"
            value={characterCount}
            description="Current caption character count"
            icon={<Newspaper className="size-4" />}
            accentClassName="bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5">
          <CardTitle>Facebook Preview</CardTitle>
          <CardDescription>
            A full-page preview canvas for how the draft could read in a social
            post layout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Safari url="www.facebook.com" className="w-full">
            {/* Facebook header */}
            <div className="relative w-full h-60">
              <Image
                src="/main/hero.png"
                alt="Facebook cover"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex px-10 -mt-10 items-center gap-3">
              <Avatar className="size-35">
                <AvatarImage src="/main/logo.png" alt="Pearl of the Orient" />
                <AvatarFallback>PO</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl tracking-tight max-w-md font-bold mt-10">
                  Pearl of the Orient International Auxiliary Chaplain Values
                  Educators Inc.
                </p>
                <p className="text-sm">1K followers • 33 following</p>
              </div>
              <div className="ml-auto flex items-center gap-2 mt-5">
                <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90">
                  <FaFacebookMessenger /> Message
                </Button>
                <Button className="bg-[#e2e5e9] hover:bg-[#e2e5e9]/90 text-black">
                  <FaBell /> Following
                </Button>
              </div>
            </div>
            <div className="min-h-full mt-5 overflow-y-auto bg-[#f0f2f5]">
              <div className="border-y border-[#d9dde3] bg-white px-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[
                      "Posts",
                      "About",
                      "Mentions",
                      "Reviews",
                      "Reels",
                      "Photos",
                    ].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={cn(
                          "relative px-5 py-5 text-[15px] font-semibold text-[#65686c]",
                          tab === "Posts" && "text-[#0866ff]",
                        )}
                      >
                        {tab}
                        {tab === "Posts" ? (
                          <span className="absolute inset-x-0 bottom-0 h-0.75 rounded-full bg-[#0866ff]" />
                        ) : null}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-1 px-5 py-5 text-[15px] font-semibold text-[#65686c]"
                    >
                      More
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    className="bg-[#e4e6eb] text-[#1c1e21]"
                    size="icon"
                  >
                    <MoreHorizontal className="size-5" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 p-7 xl:grid-cols-[0.76fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#d8dee4] bg-white p-5 shadow-sm">
                    <h3 className="text-[22px] font-bold text-[#1c1e21]">
                      Intro
                    </h3>
                    <div className="mt-5 space-y-5 text-[#1c1e21]">
                      <div className="flex items-start gap-3">
                        <BriefcaseBusiness className="mt-0.5 size-5 text-[#8d949e]" />
                        <p className="text-[15px] leading-6">
                          <span className="font-semibold">Page</span> ·
                          Religious organization
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 shrink-0 size-5 text-[#8d949e]" />
                        <p className="text-[15px] leading-6">
                          B151 L14-20 Ph1 Mabuhay City Subd., Paliparan III,
                          Dasmarinas, Philippines
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 size-5 text-[#8d949e]" />
                        <p className="text-[15px] leading-6">
                          poile2005.official@gmail.com
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="mt-0.5 size-5 text-[#8d949e]" />
                        <p className="text-[15px] leading-6">
                          Not yet rated (0 Reviews)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d8dee4] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[22px] font-bold text-[#1c1e21]">
                        Recent Posts
                      </h3>
                      <button
                        type="button"
                        className="text-[15px] font-medium text-[#0866ff]"
                      >
                        See all photos
                      </button>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 overflow-hidden rounded-2xl">
                      {(previewGallery.length
                        ? previewGallery.slice(0, 6)
                        : [
                            {
                              id: "fallback-1",
                              previewUrl: "/main/logo.png",
                              fileName: "Pearl of the Orient logo",
                            },
                            {
                              id: "fallback-2",
                              previewUrl: "/main/logo.png",
                              fileName: "Pearl of the Orient logo",
                            },
                            {
                              id: "fallback-3",
                              previewUrl: "/main/logo.png",
                              fileName: "Pearl of the Orient logo",
                            },
                          ]
                      ).map((item) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={item.id}
                          src={item.previewUrl}
                          alt={item.fileName}
                          className="aspect-square w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8dee4] bg-white p-5 shadow-sm">
                  <h3 className="text-[22px] font-bold text-[#1c1e21]">
                    Posts
                  </h3>
                  <div className="overflow-hidden mt-4 rounded-2xl border border-[#d9dde3] bg-white shadow-sm">
                    <div className="flex items-start gap-3 p-5 pb-0">
                      <Avatar className="size-12">
                        <AvatarImage
                          src="/main/logo.png"
                          alt="Pearl of the Orient"
                        />
                        <AvatarFallback>PO</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold line-clamp-1 text-[#1c1e21]">
                          Pearl of the Orient International Auxiliary Chaplain
                          Values Educators Inc.
                        </p>
                        {selectedMembers.length > 0 ? (
                          <p className="mt-1">
                            <span className="text-muted-foreground text-xs">
                              is with
                            </span>{" "}
                            {selectedMembers.map((member, index) => {
                              if (!member) return null;

                              const isLast =
                                index === selectedMembers.length - 1;

                              return (
                                <Link
                                  href={`https://pearlchaplaincy.org/profile/${member.uniqueId}`}
                                  target="_blank"
                                  className="text-xs font-medium hover:underline mr-1 inline-flex gap-1"
                                  key={member.id}
                                >
                                  {member.firstName} {member.middleInitial}
                                  {member.middleInitial ? "." : ""}{" "}
                                  {member.lastName}
                                  {!isLast && ","}
                                </Link>
                              );
                            })}
                          </p>
                        ) : null}

                        <div className="flex items-center gap-1 mt-1.5 text-xs text-[#65686c]">
                          <span>April 24 at 9:02 PM</span>
                          <span>·</span>
                          <Globe className="size-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 py-5">
                      <div className="space-y-2 px-5">
                        <p className="text-2xl font-semibold text-[#1c1e21]">
                          {title.trim() || "Your post title will appear here"}
                        </p>
                        <div className="space-y-1.5">
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                caption.trim() ||
                                "Start writing the caption to preview how your update, blog summary, or announcement will read in the post feed.",
                            }}
                            className={cn(
                              "text-sm leading-6 text-[#1c1e21]",
                              !isCaptionExpanded &&
                                shouldShowCaptionToggle &&
                                "line-clamp-4",
                            )}
                          />
                          {shouldShowCaptionToggle ? (
                            <button
                              type="button"
                              onClick={() =>
                                setIsCaptionExpanded((current) => !current)
                              }
                              className="text-sm font-semibold text-[#65686c] hover:underline"
                            >
                              {isCaptionExpanded ? "See less" : "See more"}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {hashtags.length ? (
                        <div className="flex px-5 flex-wrap gap-2">
                          {hashtags.map((tag) => (
                            <span
                              key={tag}
                              className="text-sm font-medium text-[#0866ff]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {mediaItems.length ? (
                        <div
                          className={cn(
                            "overflow-hidden",
                            mediaItems.length === 1
                              ? "grid grid-cols-1"
                              : "grid grid-cols-2 gap-2",
                          )}
                        >
                          {mediaItems.slice(0, 4).map((item) =>
                            item.kind === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={item.id}
                                src={item.previewUrl}
                                alt={item.fileName}
                                className={cn(
                                  "w-full object-cover",
                                  mediaItems.length === 1
                                    ? "max-h-136 min-h-80"
                                    : "aspect-square",
                                )}
                              />
                            ) : (
                              <video
                                key={item.id}
                                src={item.previewUrl}
                                className={cn(
                                  "w-full object-cover",
                                  mediaItems.length === 1
                                    ? "max-h-136 min-h-80"
                                    : "aspect-square",
                                )}
                                controls
                              />
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="flex min-h-96 items-center justify-center border border-dashed bg-[#f0f2f5] text-sm text-[#65686c]">
                          Media preview will appear here.
                        </div>
                      )}

                      <div className="space-y-3 px-5 rounded-b-2xl">
                        <div className="flex items-center justify-between text-[15px] text-[#65686c]">
                          <div className="flex text-sm items-center gap-4">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="size-4" />
                              <span>12</span>
                            </div>
                            <div className="flex ml-1.5 items-center gap-1">
                              <MessageCircle className="size-4" />
                              <span>2</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RiShareForwardLine className="size-5" />
                              <span>1</span>
                            </div>
                          </div>
                          <EmojiReaction />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="size-10">
                              <AvatarImage
                                src={currentUserAvatar}
                                alt={currentUserName}
                              />
                              <AvatarFallback>
                                {currentUserInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border border-white bg-[#65686c] text-[10px] text-white">
                              <ChevronDown className="size-2.5" />
                            </span>
                          </div>
                          <div className="flex flex-1 items-center justify-between rounded-full bg-[#f0f2f5] px-4 py-3 text-[#65686c]">
                            <span className="text-[15px]">
                              Comment as {currentUserName}
                            </span>
                            <div className="flex items-center gap-3">
                              <MdFaceRetouchingNatural className="size-4" />
                              <svg
                                viewBox="0 0 16 16"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <path d="M10.75 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zM6.5 6.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM6 9.941a.75.75 0 0 0-1 1.118c.776.695 1.825 1.191 3 1.191s2.224-.496 3-1.191a.75.75 0 1 0-1-1.118c-.55.493-1.255.809-2 .809-.745 0-1.45-.316-2-.809z"></path>
                                <path d="M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8z"></path>
                              </svg>
                              <Camera className="size-4" />
                              <MdOutlineGifBox className="size-4" />
                              <LuSticker className="size-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Safari>
        </CardContent>
      </Card>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 no-scrollbar sm:max-w-2xl"
        >
          <SheetHeader className="border-b">
            <SheetTitle>
              {mode === "create" ? "Create News Post" : "Update News Post"}
            </SheetTitle>
            <SheetDescription>
              Fill in the form fields here while the full preview stays visible
              on the page behind the sheet.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 p-5">
            <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
              <CardContent className="space-y-3 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-background/70 p-2">
                    <Newspaper className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Post Identity</p>
                    <p className="text-sm text-muted-foreground">
                      Start with a clear title and the main Facebook caption.
                    </p>
                  </div>
                </div>
                <Input
                  placeholder="Post title or headline"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={cn(fieldClass, "h-11 rounded-lg")}
                />
                <RichTextEditor
                  placeholder="Write the caption, story, or posting copy here..."
                  value={caption}
                  onChange={(value) => setCaption(value)}
                />
              </CardContent>
            </Card>

            <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
              <CardContent className="space-y-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-background/70 p-2">
                    <Globe className="size-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">Facebook Page Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically publish a Facebook Page feed post after this
                      news entry is created or updated.
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/60 p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      Auto-post this save to the Facebook Page
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creates a Facebook Page feed post the first time, then
                      updates that same Facebook post on later saves.
                    </p>
                  </div>
                  <Switch
                    checked={shouldSyncToFacebook}
                    onCheckedChange={setShouldSyncToFacebook}
                    aria-label="Toggle Facebook Page sync"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
              <CardContent className="space-y-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-background/70 p-2">
                    <Upload className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Media Attachments</p>
                    <p className="text-sm text-muted-foreground">
                      Add a single image, multiple images, or a supporting
                      video.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Upload images or video
                </Button>

                {mediaItems.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border bg-card"
                      >
                        <div className="relative aspect-[1.1] bg-black/5">
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
                              controls
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-3 right-3 rounded-full bg-background/90 p-1.5 shadow"
                            aria-label={`Remove ${item.fileName}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-3 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.kind === "image"
                                ? "Image asset"
                                : "Video asset"}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {item.kind === "image" ? (
                              <ImageIcon className="size-3.5" />
                            ) : (
                              <Film className="size-3.5" />
                            )}
                            {item.kind}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-card/60 p-6 text-sm text-muted-foreground">
                    No media attached yet. Add visuals to make the Facebook post
                    more engaging.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
              <CardContent className="space-y-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-background/70 p-2">
                    <Tag className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Tag Members</p>
                    <p className="text-sm text-muted-foreground">
                      Optionally connect members to the post for profile-linked
                      visibility.
                    </p>
                  </div>
                </div>

                <Popover
                  open={memberPickerOpen}
                  onOpenChange={setMemberPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between rounded-lg"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <UserPlus className="size-4" />
                        {selectedMemberIds.length
                          ? `${selectedMemberIds.length} member${
                              selectedMemberIds.length === 1 ? "" : "s"
                            } tagged`
                          : "Choose members to tag"}
                      </span>
                      <ChevronsUpDownIcon className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-105 p-0">
                    <Command>
                      <CommandInput placeholder="Search approved members..." />
                      <CommandList>
                        <CommandEmpty>
                          {membersQuery.isLoading
                            ? "Loading approved members..."
                            : "No approved members found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {selectableMembers.map((member) => {
                            const fullName = buildMemberName(member);
                            const isSelected = selectedMemberIds.includes(
                              member.id,
                            );

                            return (
                              <CommandItem
                                key={member.id}
                                value={`${fullName} ${member.user.email}`}
                                onSelect={() => {
                                  setSelectedMemberIds((current) =>
                                    current.includes(member.id)
                                      ? current.filter((id) => id !== member.id)
                                      : [...current, member.id],
                                  );
                                }}
                                className="flex items-center gap-3 py-2.5"
                              >
                                <Avatar className="size-8">
                                  <AvatarImage
                                    src={member.user.avatar ?? undefined}
                                    alt={fullName}
                                  />
                                  <AvatarFallback>
                                    {getInitials(fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {fullName}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {member.user.email}
                                  </p>
                                </div>
                                {isSelected ? (
                                  <Check className="size-4 shrink-0" />
                                ) : null}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedMembers.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => {
                      if (!member) return null;
                      const fullName = buildMemberName(member);

                      return (
                        <Badge
                          key={member.id}
                          variant="secondary"
                          className="gap-2 rounded-full px-2 py-1"
                        >
                          <Avatar className="size-5">
                            <AvatarImage
                              src={member.user.avatar ?? undefined}
                              alt={fullName}
                            />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-44 truncate">{fullName}</span>
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-background/70"
                            onClick={() =>
                              setSelectedMemberIds((current) =>
                                current.filter((id) => id !== member.id),
                              )
                            }
                            aria-label={`Remove ${fullName}`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Leave this empty if the post should not be linked to member
                    profile activity.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className={cn(surfaceClass, "rounded-lg! py-4")}>
              <CardContent className="space-y-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-background/70 p-2">
                    <Hash className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Tags & Hashtags</p>
                    <p className="text-sm text-muted-foreground">
                      Build a reusable hashtag set for discoverability and
                      campaign grouping.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add hashtag"
                    value={hashtagInput}
                    onChange={(event) => setHashtagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addHashtag();
                      }
                    }}
                    className={cn(fieldClass, "h-11 rounded-lg")}
                  />
                  <Button type="button" variant="outline" onClick={addHashtag}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-2 rounded-full px-3 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-background/70"
                        onClick={() => removeHashtag(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-0 isolate flex items-center justify-end gap-2 bg-background py-4 after:pointer-events-none after:absolute after:bottom-full after:-z-10 after:h-10 after:w-full after:bg-linear-to-t after:from-background after:to-transparent">
              <Button variant="outline" asChild>
                <Link href="/news-blogs">
                  <ArrowLeft className="size-4" />
                  Cancel
                </Link>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isInvalid || isSubmitting}
              >
                <Save className="size-4" />
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create post"
                    : "Save changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function buildMemberName(member: {
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  extensionName: string | null;
}) {
  return [
    member.firstName,
    member.middleInitial ? `${member.middleInitial.replace(/\.$/, "")}.` : null,
    member.lastName,
    member.extensionName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toAvatarUrl(avatar: string | null | undefined): string | undefined {
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
}

function getPlainText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
