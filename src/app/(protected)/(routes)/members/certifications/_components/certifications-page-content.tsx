"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Layers3, Plus, Sparkles, Users } from "lucide-react";
import { PDFDocument } from "pdf-lib";

import { SummaryStatCard } from "@/components/SummaryStatCard";
import { Button } from "@/components/ui/button";
import { MemberStatus } from "@/enums";
import { useMembersQuery } from "@/features/members/member.hooks";
import { useToast } from "@/hooks/use-toast";
import { generateCertificateBatchPdf } from "@/lib/certificate";

import { CertificateBatchSheet } from "./certificate-batch-sheet";
import { CertificateLayoutPlacementDialog } from "./certificate-layout-placement-dialog";
import { CertificateLayoutLibrary } from "./certificate-layout-library";
import { CertificateLayoutUploadCard } from "./certificate-layout-upload-card";
import type {
  CertificateNamePlacement,
  CertificatePreviewItem,
  UploadedCertificateLayout,
} from "./certifications.types";
import { buildMemberName } from "./certifications.utils";

const DEFAULT_NAME_PLACEMENT: CertificateNamePlacement = {
  centerXPercent: 50,
  centerYPercent: 49,
  maxWidthPercent: 62,
  fontSizePercent: 4.8,
  colorHex: "#034316",
  forceUppercase: true,
};

function isDefinedMember<T>(member: T | undefined): member is T {
  return member !== undefined;
}

export function CertificationsPageContent() {
  const { toast } = useToast();
  const membersQuery = useMembersQuery({
    limit: 100,
    status: MemberStatus.APPROVED,
  });

  const layoutInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedLayoutsRef = useRef<UploadedCertificateLayout[]>([]);
  const previewItemsRef = useRef<CertificatePreviewItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [uploadedLayouts, setUploadedLayouts] = useState<UploadedCertificateLayout[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [checkedParticipantIds, setCheckedParticipantIds] = useState<string[]>([]);
  const [participantPickerOpen, setParticipantPickerOpen] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");
  const [editingLayoutId, setEditingLayoutId] = useState<string>("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [previewItems, setPreviewItems] = useState<CertificatePreviewItem[]>([]);

  useEffect(() => {
    uploadedLayoutsRef.current = uploadedLayouts;
  }, [uploadedLayouts]);

  useEffect(() => {
    previewItemsRef.current = previewItems;
  }, [previewItems]);

  useEffect(() => {
    return () => {
      uploadedLayoutsRef.current.forEach((layout) => {
        if (layout.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(layout.previewUrl);
        }
      });

      previewItemsRef.current.forEach((item) => {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const selectableMembers = useMemo(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data?.data],
  );

  const selectedParticipants = useMemo(
    () =>
      selectedParticipantIds
        .map((memberId) => selectableMembers.find((member) => member.id === memberId))
        .filter(isDefinedMember),
    [selectableMembers, selectedParticipantIds],
  );
  const checkedParticipants = useMemo(
    () =>
      checkedParticipantIds
        .map((memberId) => selectedParticipants.find((member) => member.id === memberId))
        .filter(isDefinedMember),
    [checkedParticipantIds, selectedParticipants],
  );

  const selectedLayout =
    uploadedLayouts.find((layout) => layout.id === selectedLayoutId) ?? null;
  const editingLayout =
    uploadedLayouts.find((layout) => layout.id === editingLayoutId) ?? null;
  const isInvalid = checkedParticipants.length === 0 || !selectedLayout;

  useEffect(() => {
    setCheckedParticipantIds((current) => {
      const selectedSet = new Set(selectedParticipantIds);
      const retained = current.filter((id) => selectedSet.has(id));
      const missing = selectedParticipantIds.filter((id) => !retained.includes(id));
      return [...retained, ...missing];
    });
  }, [selectedParticipantIds]);

  useEffect(() => {
    let active = true;

    async function generatePreviewPdfs() {
      if (isInvalid || !selectedLayout || !checkedParticipants.length) {
        setPreviewItems((current) => {
          current.forEach((item) => {
            if (item.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(item.previewUrl);
            }
          });
          return [];
        });
        return;
      }

      const nextItems: CertificatePreviewItem[] = [];

      try {
        for (const member of checkedParticipants) {
          if (!member) continue;

          const participantName = buildMemberName(member);
          const previewBlob = await generateCertificateBatchPdf({
            layoutUrl: selectedLayout.previewUrl,
            namePlacement: selectedLayout.namePlacement,
            entries: [
              {
                recipientName: participantName,
              },
            ],
          });

          if (!active) return;

          nextItems.push({
            memberId: member.id,
            participantName,
            previewUrl: window.URL.createObjectURL(previewBlob),
            pageWidth: selectedLayout.pageWidth,
            pageHeight: selectedLayout.pageHeight,
          });
        }

        if (!active) {
          nextItems.forEach((item) => window.URL.revokeObjectURL(item.previewUrl));
          return;
        }

        setPreviewItems((current) => {
          current.forEach((item) => {
            if (item.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(item.previewUrl);
            }
          });
          return nextItems;
        });
      } catch {
        nextItems.forEach((item) => window.URL.revokeObjectURL(item.previewUrl));
        if (!active) return;
        setPreviewItems((current) => {
          current.forEach((item) => {
            if (item.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(item.previewUrl);
            }
          });
          return [];
        });
      }
    }

    void generatePreviewPdfs();

    return () => {
      active = false;
    };
  }, [
    checkedParticipants,
    isInvalid,
    selectedLayout,
  ]);

  const handleLayoutUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const pdfFiles = files.filter(
      (file) =>
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
    );

    const nextLayouts: UploadedCertificateLayout[] = [];

    for (const file of pdfFiles) {
      try {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const firstPage = pdf.getPage(0);
        const { width, height } = firstPage.getSize();

        nextLayouts.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          previewUrl: URL.createObjectURL(file),
          fileName: file.name,
          pageWidth: width,
          pageHeight: height,
          namePlacement: { ...DEFAULT_NAME_PLACEMENT },
        });
      } catch {
        toast({
          title: "Unreadable PDF skipped",
          description: `${file.name} could not be parsed as a certificate layout.`,
          variant: "warning",
        });
      }
    }

    if (!nextLayouts.length) {
      toast({
        title: "No valid PDF found",
        description:
          "Please upload certificate layout PDF files only.",
        variant: "warning",
      });
      return;
    }

    setUploadedLayouts((current) => {
      const combined = [...current, ...nextLayouts];
      if (!selectedLayoutId && combined[0]) {
        setSelectedLayoutId(combined[0].id);
      }
      return combined;
    });

    toast({
      title: "Layout uploaded",
      description: `${nextLayouts.length} certificate layout${
        nextLayouts.length === 1 ? "" : "s"
      } added successfully.`,
      variant: "success",
    });

    event.target.value = "";
  };

  const handleRemoveLayout = (layoutId: string) => {
    setUploadedLayouts((current) => {
      const layout = current.find((item) => item.id === layoutId);
      if (layout?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(layout.previewUrl);
      }

      const next = current.filter((item) => item.id !== layoutId);

      if (selectedLayoutId === layoutId) {
        setSelectedLayoutId(next[0]?.id ?? "");
      }

      if (editingLayoutId === layoutId) {
        setEditingLayoutId("");
      }

      return next;
    });
  };

  const handlePrepareCertificateBatch = () => {
    if (isInvalid) {
      toast({
        title: "Complete the batch setup",
        description:
          "Please check at least one participant and choose an uploaded certificate layout.",
        variant: "warning",
      });
      return;
    }

    toast({
      title: "Certificate batch prepared",
      description: `${checkedParticipants.length} certificate${
        checkedParticipants.length === 1 ? "" : "s"
      } are ready using the ${selectedLayout?.name} layout.`,
      variant: "success",
    });
  };

  const handleDownloadBatchPdf = async () => {
    if (isInvalid || !selectedLayout) {
      toast({
        title: "Complete the batch setup",
        description:
          "Please check at least one participant and choose a layout before downloading the PDF batch.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsExportingPdf(true);

      const batchPdf = await generateCertificateBatchPdf({
        layoutUrl: selectedLayout.previewUrl,
        namePlacement: selectedLayout.namePlacement,
        entries: checkedParticipants.map((member) => ({
          recipientName: buildMemberName(member),
        })),
      });

      const objectUrl = window.URL.createObjectURL(batchPdf);
      const downloadLink = document.createElement("a");
      const fileLabel =
        selectedLayout?.name.trim().replace(/\.[^/.]+$/, "").replace(/[\\/:*?"<>|]+/g, "-") ||
        "certificate-batch";

      downloadLink.href = objectUrl;
      downloadLink.download = `${fileLabel}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast({
        title: "Batch PDF ready",
        description: `Generated ${checkedParticipants.length} certificate page${
          checkedParticipants.length === 1 ? "" : "s"
        } using your uploaded layout.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Unable to generate PDF",
        description:
          error instanceof Error
            ? error.message
            : "The certificate batch could not be generated.",
        variant: "error",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <section className="space-y-6 p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Certifications & Recognitions
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload certificate layout PDFs, manage your template library, and
            generate certificate batches in a guided sheet workflow.
          </p>
        </div>

        <Button onClick={() => setIsSheetOpen(true)} disabled={!uploadedLayouts.length}>
          <Plus className="size-4" />
          Create certificate batch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryStatCard
          label="Layouts Uploaded"
          value={uploadedLayouts.length}
          description="PDF templates ready for certificate generation"
          icon={<Layers3 className="size-4" />}
          accentClassName="bg-emerald-700/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300"
        />
        <SummaryStatCard
          label="Participants Selected"
          value={selectedParticipantIds.length}
          description="Current generation selection"
          icon={<Users className="size-4" />}
          accentClassName="bg-[#032a0d]/10 text-[#032a0d]"
        />
        <SummaryStatCard
          label="Workflow"
          value="Sheet-based"
          description="Open the generator to prepare certificate cards"
          icon={<Sparkles className="size-4" />}
          accentClassName="bg-violet-700/10 text-violet-700 dark:bg-violet-300/10 dark:text-violet-300"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <CertificateLayoutUploadCard
          layoutInputRef={layoutInputRef}
          onUploadChange={handleLayoutUpload}
        />

        <CertificateLayoutLibrary
          uploadedLayouts={uploadedLayouts}
          selectedLayoutId={selectedLayoutId}
          onSelectLayout={setSelectedLayoutId}
          onRemoveLayout={handleRemoveLayout}
          onEditPlacement={setEditingLayoutId}
        />
      </div>

      <CertificateBatchSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        participantPickerOpen={participantPickerOpen}
        onParticipantPickerOpenChange={setParticipantPickerOpen}
        selectedParticipantIds={selectedParticipantIds}
        checkedParticipantIds={checkedParticipantIds}
        selectableMembers={selectableMembers}
        selectedParticipants={selectedParticipants}
        onToggleParticipant={(memberId) =>
          setSelectedParticipantIds((current) =>
            current.includes(memberId)
              ? current.filter((id) => id !== memberId)
              : [...current, memberId],
          )
        }
        onRemoveParticipant={(memberId) =>
          setSelectedParticipantIds((current) => current.filter((id) => id !== memberId))
        }
        onToggleCheckedParticipant={(memberId) =>
          setCheckedParticipantIds((current) =>
            current.includes(memberId)
              ? current.filter((id) => id !== memberId)
              : [...current, memberId],
          )
        }
        onSetAllCheckedParticipants={(checked) =>
          setCheckedParticipantIds(checked ? selectedParticipants.map((member) => member.id) : [])
        }
        isMembersLoading={membersQuery.isLoading}
        uploadedLayouts={uploadedLayouts}
        selectedLayoutId={selectedLayoutId}
        onSelectLayout={setSelectedLayoutId}
        onPrepareBatch={handlePrepareCertificateBatch}
        onDownloadBatch={handleDownloadBatchPdf}
        isInvalid={isInvalid}
        isExportingPdf={isExportingPdf}
        previewItems={previewItems}
      />

      <CertificateLayoutPlacementDialog
        layout={editingLayout}
        open={Boolean(editingLayout)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLayoutId("");
          }
        }}
        onSave={(layoutId, placement) => {
          setUploadedLayouts((current) =>
            current.map((layout) =>
              layout.id === layoutId
                ? {
                    ...layout,
                    namePlacement: placement,
                  }
                : layout,
            ),
          );

          toast({
            title: "Placement saved",
            description: "This layout will now use its own recipient-name position.",
            variant: "success",
          });
        }}
      />
    </section>
  );
}
