"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IconPlus } from "@tabler/icons-react";
import CreatableSelect from "@/components/CreatableSelect";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";

export type CreateFaqPayload = {
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
};

type CreateFaqDialogProps = {
  categories: string[];
  onAddCategory: (name: string) => void;
  onCreate: (payload: CreateFaqPayload) => void;
};

const titleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const CreateFaqDialog = ({
  categories,
  onAddCategory,
  onCreate,
}: CreateFaqDialogProps) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(categories[0] ?? "Other");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const isValid = useMemo(
    () => question.trim().length > 0 && answer.trim().length > 0,
    [question, answer],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setCategory(categories[0] ?? "Other");
      setQuestion("");
      setAnswer("");
      setIsVisible(true);
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;

    onCreate({
      category,
      question: question.trim(),
      answer: answer.trim(),
      isVisible,
    });
    setOpen(false);
  };

  const handleCategoryChange = (value: string) => {
    const formattedValue = titleCase(value);
    setCategory(formattedValue);

    if (
      !categories.some(
        (existingCategory) =>
          existingCategory.toLowerCase() === formattedValue.toLowerCase(),
      )
    ) {
      onAddCategory(formattedValue);
    }
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((topic) => ({
        label: topic,
        value: topic,
      })),
    [categories],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="xs" variant="outline">
          <IconPlus className="size-3.5" />
          Create Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle>Create a new FAQ</DialogTitle>
          <DialogDescription>
            Add a question and answer to guide members and ministry users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <p className="text-sm font-medium mb-1.5">Topic category</p>
              <p className="text-muted-foreground text-xs mb-2">
                Select which ministry topic this FAQ belongs to.
              </p>
              <CreatableSelect
                value={category}
                onValueChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="Select or type to create..."
                searchPlaceholder="Search categories..."
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5">Question</p>
              <p className="text-muted-foreground text-xs mb-2">
                Keep it short and easy to understand.
              </p>
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="e.g. How do I request a chaplaincy counseling session?"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1.5">Answer</p>
            <p className="text-muted-foreground text-xs mb-2">
              Provide clear steps or a helpful explanation.
            </p>
            <RichTextEditor
              value={answer}
              onChange={(value) => setAnswer(value)}
              placeholder="Write the answer here..."
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Visibility</p>
              <p className="text-muted-foreground text-xs">
                If disabled, this FAQ will be hidden from users.
              </p>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              size="xs"
            >
              Cancel
            </Button>
            <Button
              size="xs"
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
