"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { PolicyItem } from "./policy-definitions";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Save } from 'lucide-react';

type EditPolicyDialogProps = {
  policy: PolicyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, content: string, isPublished: boolean) => void;
};

export const EditPolicyDialog = ({
  policy,
  open,
  onOpenChange,
  onSave,
}: EditPolicyDialogProps) => {
  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle>{policy.name}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          {policy.description}
        </p>
        <EditPolicyForm
          policy={policy}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

type EditPolicyFormProps = {
  policy: PolicyItem;
  onSave: (id: string, content: string, isPublished: boolean) => void;
  onCancel: () => void;
};

const EditPolicyForm = ({ policy, onSave, onCancel }: EditPolicyFormProps) => {
  const [content, setContent] = useState(policy.content);
  const [isPublished, setIsPublished] = useState(policy.isPublished);

  useEffect(() => {
    setContent(policy.content);
    setIsPublished(policy.isPublished);
  }, [policy.id, policy.content, policy.isPublished]);

  const handleSave = () => {
    onSave(policy.id, content, isPublished);
    onCancel();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Label htmlFor="policy-content">Content</Label>
        <RichTextEditor
          value={content}
          onChange={(value) => setContent(value)}
          placeholder="Enter the full policy text. You can use plain text or simple formatting."
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="policy-published" className="text-sm">
          Published (visible to users)
        </Label>
        <Switch
          id="policy-published"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
      </div>
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="xs" onClick={handleSave}>
          <Save className='size-3.5' /> Save changes
        </Button>
      </div>
    </div>
  );
};
