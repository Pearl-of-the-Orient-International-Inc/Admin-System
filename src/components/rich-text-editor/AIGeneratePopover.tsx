"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SparklesIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  HelpCircleIcon,
  Settings2Icon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { useToast } from "@/hooks/use-toast";

const toneList = [
  "Expert",
  "Daring",
  "Playful",
  "Sophisticated",
  "Persuasive",
  "Professional",
  "Supportive",
  "Average",
];

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
});

const MODEL_ID = process.env.NEXT_PUBLIC_OPENAI_MODEL_ID || "gpt-4o-mini";

interface AIGeneratePopoverProps {
  editor: Editor;
}

export const AIGeneratePopover = ({ editor }: AIGeneratePopoverProps) => {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Expert");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [open, setOpen] = useState(false);

  const generateAITextMutation = useMutation({
    mutationFn: async ({
      prompt,
      tone,
      instructions,
    }: {
      prompt: string;
      tone: string;
      instructions?: string;
    }) => {
      let systemPrompt =
        `You are an expert content writer for a rich text editor that uses HTML internally.` +
        ` Generate high-quality, engaging content based on the user's request.` +
        ` Write in a ${tone.toLowerCase()} tone.` +
        `\n\nOutput STRICTLY as HTML fragments only (no <html>, <head>, or <body> tags).` +
        ` Use semantic tags supported by a typical editor: <p>, <h1>-<h4>, <strong>, <em>, <u>, <s>,` +
        ` <ul>, <ol>, <li>, <blockquote>, <a>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <br>.` +
        ` Do not include any markdown, backticks, or plain-text bullets; use proper HTML lists instead.`;

      if (instructions && instructions.trim()) {
        systemPrompt += ` Special instructions: ${instructions.trim()}`;
      }

      const result = await generateText({
        model: openai(MODEL_ID),
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.7,
        maxOutputTokens: 1000,
      });

      return result.text;
    },
    onSuccess: (text) => {
      if (editor) {
        editor.chain().focus().insertContent(text).run();
        toast({
          title: "Content Generated",
          description:
            "Your AI-generated content has been inserted successfully.",
          variant: "success",
        });
      }
      setAiPrompt("");
      setSpecialInstructions("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "error",
      });
    },
  });

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "info",
      });
      return;
    }
    generateAITextMutation.mutate({
      prompt: aiPrompt,
      tone: selectedTone,
      instructions: specialInstructions,
    });
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button size="sm" type="button" variant="ghost">
                  <SparklesIcon className="size-4" />
                  <ChevronDownIcon className="size-3" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Generate content with AI</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent
          className="p-0 pb-5 border shadow-2xl w-120"
          align="end"
          side="top"
          sideOffset={8}
        >
          <div className="grid gap-4">
            <div className="bg-secondary flex items-center gap-2 p-3 rounded-lg">
              <h3 className="font-medium text-sm">Generate content</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircleIcon className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter a prompt to generate content using AI</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGenerateAI();
              }}
              className="px-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <Label>What&apos;s this content about?</Label>
                <Textarea
                  placeholder="e.g., how to bake the perfect chocolate chip cookie"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleGenerateAI();
                    }
                  }}
                />
              </div>
              {showSpecialInstructions && (
                <div className="space-y-2 mt-3">
                  <Label>Special instructions (optional)</Label>
                  <Input
                    placeholder="e.g., replace some words with emoji"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="xs" type="button">
                      Tone: {selectedTone}{" "}
                      <ChevronsUpDownIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-40"
                    align="start"
                    side="top"
                  >
                    <DropdownMenuGroup>
                      {toneList.map((item) => (
                        <DropdownMenuItem
                          key={item}
                          onClick={() => setSelectedTone(item)}
                        >
                          {item}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setShowSpecialInstructions(!showSpecialInstructions)
                          }
                        >
                          <Settings2Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {showSpecialInstructions
                          ? "Hide special instructions"
                          : "Show special instructions"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    size="xs"
                    type="button"
                    disabled={generateAITextMutation.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleGenerateAI();
                    }}
                  >
                    {generateAITextMutation.isPending
                      ? "Generating..."
                      : "Generate"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
