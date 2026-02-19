"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  LinkIcon,
  ImageIcon,
  VideoIcon,
  MoreHorizontalIcon,
  OutdentIcon,
  IndentIcon,
  TableIcon,
  TrashIcon,
  PlusIcon,
  EraserIcon,
  TypeIcon,
  UndoIcon,
  RedoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { useToast } from '@/hooks/use-toast';

const colorPalette = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#FFA500", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
  "#808080", // Gray
  "#C0C0C0", // Silver
];

interface MenuBarProps {
  editor: Editor | null;
}

export const MenuBar = ({
  editor,
}: MenuBarProps) => {
  const {toast} = useToast()
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Image URL Required",
        description: "Please enter an image URL to insert.",
        variant: "info"
      })
      return;
    }
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      toast({
        title: "Image Inserted",
        description: "The image has been successfully inserted.",
        variant: "success"
      })
    }
  };

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Video URL Required",
        description: "Please enter a video URL to insert.",
        variant: "info"
      })
      return;
    }
    if (editor) {
      // TipTap doesn't have built-in video support, so we'll use an iframe
      editor
        .chain()
        .focus()
        .insertContent(
          `<iframe src="${videoUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`
        )
        .run();
      setVideoUrl("");
      toast({
        title: "Video Inserted",
        description: "The video has been successfully inserted.",
        variant: "success"
      })
    }
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to insert.",
        variant: "info"
      })
      return;
    }
    if (editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setLinkText("");
      toast({
        title: "Link Inserted",
        description: "The link has been successfully inserted.",
        variant: "success"
      })
    }
  };

  const getCurrentHeading = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor.isActive("heading", { level: 6 })) return "Heading 6";
    if (editor.isActive("blockquote")) return "Blockquote";
    return "Paragraph";
  };

  const getCurrentAlignment = () => {
    if (!editor) return "left";
    if (editor.isActive({ textAlign: "left" })) return "left";
    if (editor.isActive({ textAlign: "center" })) return "center";
    if (editor.isActive({ textAlign: "right" })) return "right";
    return "left";
  };

  const getTextColor = () => {
    if (!editor) return "#000000";
    const color = editor.getAttributes("textStyle").color;
    return color || "#000000";
  };

  const getBackgroundColor = () => {
    if (!editor) return "#FFFFFF";
    const color = editor.getAttributes("highlight").color;
    return color || "#FFFFFF";
  };

  if (!editor) return null;

  return (
    <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 flex flex-wrap gap-1 items-center">
      <TooltipProvider>
        {/* Paragraph Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  {getCurrentHeading()}
                  <ChevronDownIcon className="size-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Text style</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <span className="text-2xl font-bold">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <span className="text-xl font-bold">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <span className="text-lg font-bold">Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
            >
              <span className="text-base font-bold">Heading 4</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
            >
              <span className="text-sm font-bold">Heading 5</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
            >
              <span className="text-xs font-bold">Heading 6</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              Blockquote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Text Formatting */}
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                className={cn(
                  editor.isActive("bold") && "bg-muted text-muted-foreground"
                )}
              >
                <BoldIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>Bold</span>
                <Kbd>Ctrl+B</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={cn(
                  editor.isActive("italic") && "bg-muted text-muted-foreground"
                )}
              >
                <ItalicIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>Italic</span>
                <Kbd>Ctrl+I</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
                className={cn(
                  editor.isActive("underline") &&
                    "bg-muted text-muted-foreground"
                )}
              >
                <UnderlineIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>Underline</span>
                <Kbd>Ctrl+U</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Color Picker */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                  <TypeIcon className="size-4" />
                  <div
                    className="size-3 rounded border ml-2"
                    style={{ backgroundColor: getTextColor() }}
                  />
                  <ChevronDownIcon className="size-3 ml-1" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Text color</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64" align="start">
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className="size-8 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Label>Custom Color</Label>
                  <Input
                    type="color"
                    className="mt-2 h-10"
                    value={getTextColor()}
                    onChange={(e) => {
                      editor.chain().focus().setColor(e.target.value).run();
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="background" className="mt-4">
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className="size-8 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Label>Custom Color</Label>
                  <Input
                    type="color"
                    className="mt-2 h-10"
                    value={getBackgroundColor()}
                    onChange={(e) => {
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: e.target.value })
                        .run();
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Alignment */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="xs" variant="ghost">
                  {getCurrentAlignment() === "left" && (
                    <AlignLeftIcon className="size-4" />
                  )}
                  {getCurrentAlignment() === "center" && (
                    <AlignCenterIcon className="size-4" />
                  )}
                  {getCurrentAlignment() === "right" && (
                    <AlignRightIcon className="size-4" />
                  )}
                  <ChevronDownIcon className="size-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Text alignment</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeftIcon className="size-4" />
              Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenterIcon className="size-4" />
              Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRightIcon className="size-4" />
              Right
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Options (Ellipsis) */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="xs" variant="ghost">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent className='w-50' align="end">
            {/* Link */}
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <LinkIcon className="size-4" />
                  Insert Link
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Link</DialogTitle>
                  <DialogDescription>
                    Enter the URL and optional link text
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInsertLink();
                  }}
                  className="space-y-4"
                >
                  <div className='space-y-2'>
                    <Label>URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Link Text (optional)</Label>
                    <Input
                      placeholder="Link text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Insert Link
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Image */}
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <ImageIcon className="size-4" />
                  Insert Image
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Image</DialogTitle>
                  <DialogDescription>
                    Enter the image URL to insert
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInsertImage();
                  }}
                  className="space-y-4"
                >
                  <div className='space-y-2'>
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Insert Image
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Video */}
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <VideoIcon className="size-4" />
                  Insert Video
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Video</DialogTitle>
                  <DialogDescription>
                    Enter the video URL (YouTube, Vimeo, etc.)
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInsertVideo();
                  }}
                  className="space-y-4"
                >
                  <div className='space-y-2'>
                    <Label>Video URL</Label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Insert Video
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListIcon className="size-4" />
              Bulleted List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrderedIcon className="size-4" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().liftListItem("listItem").run()
              }
            >
              <OutdentIcon className="size-4" />
              Outdent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().sinkListItem("listItem").run()
              }
            >
              <IndentIcon className="size-4" />
              Indent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <TableIcon className="size-4" />
                Insert Table
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                >
                  <PlusIcon className="size-4" />
                  Insert Table
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  disabled={!editor.can().addRowBefore()}
                >
                  <PlusIcon className="size-4" />
                  Insert Row Above
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  disabled={!editor.can().addRowAfter()}
                >
                  <PlusIcon className="size-4" />
                  Insert Row Below
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  disabled={!editor.can().addColumnBefore()}
                >
                  <PlusIcon className="size-4" />
                  Insert Column Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  disabled={!editor.can().addColumnAfter()}
                >
                  <PlusIcon className="size-4" />
                  Insert Column After
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  disabled={!editor.can().deleteRow()}
                >
                  <TrashIcon className="size-4" />
                  Delete Row
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  disabled={!editor.can().deleteColumn()}
                >
                  <TrashIcon className="size-4" />
                  Delete Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  disabled={!editor.can().deleteTable()}
                >
                  <TrashIcon className="size-4" />
                  Delete Table
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
            >
              <EraserIcon className="size-4" />
              Clear Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex ml-auto flex-wrap">
          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="xs"
                variant="ghost"
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <UndoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>Undo</span>
                <Kbd>Ctrl+Z</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="xs"
                variant="ghost"
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <RedoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>Redo</span>
                <Kbd>Ctrl+Y</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
