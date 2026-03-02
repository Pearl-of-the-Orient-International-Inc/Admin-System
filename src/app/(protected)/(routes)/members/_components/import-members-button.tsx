"use client";

import { useRef } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ImportMembersButton() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({
      variant: "success",
      title: "Excel selected",
      description: `${file.name} is ready for batch upload.`,
    });

    event.currentTarget.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button onClick={handleOpenPicker}>
        <FileSpreadsheet className="size-4" />
        Import Excel
      </Button>
    </>
  );
}
