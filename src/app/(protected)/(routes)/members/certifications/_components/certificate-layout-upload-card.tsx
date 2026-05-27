"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconAlertCircle, IconCloudUpload } from "@tabler/icons-react";

type Props = {
  layoutInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CertificateLayoutUploadCard({
  layoutInputRef,
  onUploadChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Certificate Layout</CardTitle>
        <CardDescription>
          Upload a certificate PDF layout that will be used as the base template
          for participant generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={layoutInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={onUploadChange}
        />

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl bg-primary/5 border-dashed flex-col py-20"
          onClick={() => layoutInputRef.current?.click()}
        >
          <IconCloudUpload className="size-10 text-primary" strokeWidth={1.5} />
          Upload certificate layout PDF
          <p className="text-xs text-muted-foreground">
            Drag and drop your PDF here <br /> or click to browse
          </p>
        </Button>

        <div className="rounded-xl border flex items-start gap-1 border-dashed bg-blue-600/10 text-blue-600 p-4 text-xs">
        <IconAlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
          Use a print-ready PDF file. After upload, you can adjust the participant
          name placement for that specific certificate layout.
        </div>
      </CardContent>
    </Card>
  );
}
