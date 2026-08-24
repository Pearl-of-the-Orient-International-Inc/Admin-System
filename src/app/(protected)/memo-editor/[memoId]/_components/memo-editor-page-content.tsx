"use client";

import { DocxEditor, type DocxEditorRef } from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Fragment as ProseMirrorFragment } from "prosemirror-model";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Mail,
  Save,
  Signature,
  UserPlus,
  X,
} from "lucide-react";

import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import SignatureInput from "@/components/ui/signature-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";
import {
  useCreateMemoAnnouncementMutation,
  useMemoAnnouncementByIdQuery,
  useMemoRecipientSearchQuery,
  usePublishMemoAnnouncementMutation,
  useUpdateMemoAnnouncementMutation,
} from "@/features/memo-announcements/memo-announcement.hooks";
import type {
  MemoRecipientOption,
  MemoRecipientScope,
  MemoRecipientTarget,
} from "@/features/memo-announcements/memo-announcement.types";
import { cn } from "@/lib/utils";

type MemoTemplateType =
  | "ANNOUNCEMENT"
  | "GENERAL_OFFICE"
  | "INCIDENT_REPORT"
  | "MEETING_NOTICE"
  | "POLICY_CHANGE"
  | "BLANK";

const memoTemplateFileMap: Record<MemoTemplateType, string> = {
  ANNOUNCEMENT: "/memo-templates/Announcement.docx",
  GENERAL_OFFICE: "/memo-templates/General_Office.docx",
  INCIDENT_REPORT: "/memo-templates/Incident_Report.docx",
  MEETING_NOTICE: "/memo-templates/Meeting_Notice.docx",
  POLICY_CHANGE: "/memo-templates/Policy_Change.docx",
  BLANK: "/memo-templates/Blank_Others.docx",
};

const memoTemplateTitleMap: Record<MemoTemplateType, string> = {
  ANNOUNCEMENT: "Announcement",
  GENERAL_OFFICE: "General Office",
  INCIDENT_REPORT: "Incident Report",
  MEETING_NOTICE: "Meeting Notice",
  POLICY_CHANGE: "Policy Change",
  BLANK: "Blank Template",
};

const legacyMemoTypeMap: Record<string, MemoTemplateType> = {
  Announcement: "ANNOUNCEMENT",
  "General Office": "GENERAL_OFFICE",
  "Incident Report": "INCIDENT_REPORT",
  "Meeting Notice": "MEETING_NOTICE",
  "Policy Change": "POLICY_CHANGE",
  "Blank Template (Others)": "BLANK",
};

const normalizeMemoType = (value: string | null): MemoTemplateType => {
  if (!value) {
    return "ANNOUNCEMENT";
  }

  if (value in memoTemplateFileMap) {
    return value as MemoTemplateType;
  }

  return legacyMemoTypeMap[value] ?? "ANNOUNCEMENT";
};

const toFileSafeSegment = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const buildMemoDocumentTimestamp = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}${second}`;
};

const downloadBufferAsDocx = (buffer: ArrayBuffer, fileName: string) => {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
};

type MemoSignatory = {
  id: string;
  printedName: string;
  designation: string;
  signatureDataUrl: string | null;
  position: "left" | "center" | "right";
};

export function MemoEditorPageContent() {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUserQuery();
  const { memoId } = useParams<{ memoId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const editorRef = useRef<DocxEditorRef | null>(null);

  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const [recipientScope, setRecipientScope] =
    useState<MemoRecipientScope>("SPECIFIC");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<
    MemoRecipientOption[]
  >([]);
  const [isSignatoryDialogOpen, setIsSignatoryDialogOpen] = useState(false);
  const [printedNameInput, setPrintedNameInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatories, setSignatories] = useState<MemoSignatory[]>([]);
  const [documentName, setDocumentName] = useState("Untitled Memo.docx");
  const [reservedMemo, setReservedMemo] = useState<{
    id: string;
    referenceNumber: string;
  } | null>(null);
  const hasInitializedDocumentName = useRef(false);
  const hasReservedMemoRef = useRef(false);
  const hasAppliedReferenceNumber = useRef(false);
  const documentTimestampRef = useRef(buildMemoDocumentTimestamp(new Date()));
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const createMemoMutation = useCreateMemoAnnouncementMutation();
  const updateMemoMutation = useUpdateMemoAnnouncementMutation();
  const publishMemoMutation = usePublishMemoAnnouncementMutation();

  const mode = memoId === "create" ? "CREATE" : "UPDATE";
  const memoQuery = useMemoAnnouncementByIdQuery(memoId, mode === "UPDATE");
  const recipientsQuery = useMemoRecipientSearchQuery(recipientSearch);
  const memoType = normalizeMemoType(searchParams.get("type"));
  const customType = searchParams.get("customType")?.trim() ?? "";

  const pageTitle = useMemo(() => {
    if (memoType === "BLANK" && customType) {
      return customType;
    }

    return memoTemplateTitleMap[memoType];
  }, [customType, memoType]);

  const templatePath = memoTemplateFileMap[memoType];
  const generatedDocumentName = useMemo(() => {
    const memoLabel = memoType === "BLANK" && customType ? customType : pageTitle;
    const safeMemoLabel = toFileSafeSegment(memoLabel) || "memo";
    const safeUserLabel =
      toFileSafeSegment(currentUser?.name ?? "") ||
      toFileSafeSegment(currentUser?.email?.split("@")[0] ?? "") ||
      "admin-user";

    return `${safeMemoLabel}-${safeUserLabel}-${documentTimestampRef.current}.docx`;
  }, [currentUser?.email, currentUser?.name, customType, memoType, pageTitle]);

  useEffect(() => {
    if (hasInitializedDocumentName.current) {
      return;
    }

    if (isCurrentUserLoading) {
      return;
    }

    setDocumentName(generatedDocumentName);
    hasInitializedDocumentName.current = true;
  }, [generatedDocumentName, isCurrentUserLoading]);

  useEffect(() => {
    const memo = memoQuery.data;

    if (!memo) return;

    setSelectedRecipients(
      memo.recipients
        .filter((recipient) => recipient.type === "MEMBER")
        .map((recipient) => ({
          id: recipient.memberId ?? recipient.id,
          type: recipient.type,
          name: recipient.name,
          email: recipient.email,
          avatar: null,
          label: "Member",
          meta: recipient.type,
        })),
    );
    setDocumentName(memo.documentName);
    hasInitializedDocumentName.current = true;
  }, [memoQuery.data]);

  useEffect(() => {
    let isMounted = true;

    const loadTemplate = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(templatePath);

        if (!response.ok) {
          throw new Error("Unable to load the memo template.");
        }

        const nextBuffer = await response.arrayBuffer();

        if (!isMounted) {
          return;
        }

        setBuffer(nextBuffer);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load the requested memo template.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTemplate();

    return () => {
      isMounted = false;
    };
  }, [templatePath]);

  useEffect(() => {
    if (mode !== "CREATE") return;
    if (hasReservedMemoRef.current) return;
    if (isCurrentUserLoading || !hasInitializedDocumentName.current) return;

    hasReservedMemoRef.current = true;

    createMemoMutation
      .mutateAsync({
        title: pageTitle,
        category: memoType,
        customCategory: memoType === "BLANK" ? customType || null : null,
        summary: null,
        documentName,
        recipientScope,
        recipientTargets: [],
      })
      .then((memo) => {
        setReservedMemo({
          id: memo.id,
          referenceNumber: memo.referenceNumber,
        });
      })
      .catch((error) => {
        hasReservedMemoRef.current = false;
        toast({
          variant: "error",
          title: "Reference number failed",
          description:
            error instanceof Error
              ? error.message
              : "The memo reference number could not be generated.",
        });
      });
  }, [
    createMemoMutation,
    customType,
    documentName,
    isCurrentUserLoading,
    memoType,
    mode,
    pageTitle,
    recipientScope,
    toast,
  ]);

  const buildRecipientTargets = (): MemoRecipientTarget[] =>
    selectedRecipients.map((recipient) => ({
      type: recipient.type,
      id: recipient.id,
    }));

  const applyReferenceNumberToDocument = (nextReferenceNumber: string) => {
    const view = editorRef.current?.getEditorRef()?.getView();

    if (!view) return false;

    const replacements: Array<{ from: number; to: number; text: string }> = [];

    view.state.doc.descendants((node, position) => {
      if (!node.isText || !node.text) return;

      const originalText = node.text;
      const nextText = originalText
        .replace(/MEMO\s*NO\.:?/gi, "REF. NO.:")
        .replace(/\[?\d{3,4}-\[YEAR\]\]?/gi, nextReferenceNumber)
        .replace(/\[?R\d{4}-\d{4}\]?/g, nextReferenceNumber)
        .replace(/\bR\d{4}-\d{4}\b/g, nextReferenceNumber);

      if (nextText !== originalText) {
        replacements.push({
          from: position,
          to: position + originalText.length,
          text: nextText,
        });
      }
    });

    if (!replacements.length) return false;

    let transaction = view.state.tr;

    for (const replacement of replacements.reverse()) {
      transaction = transaction.insertText(
        replacement.text,
        replacement.from,
        replacement.to,
      );
    }

    view.dispatch(transaction.scrollIntoView());
    editorRef.current?.getEditorRef()?.focus();
    return true;
  };

  const activeMemoId = mode === "UPDATE" ? memoId : reservedMemo?.id;
  const activeReferenceNumber =
    memoQuery.data?.referenceNumber ?? reservedMemo?.referenceNumber;

  useEffect(() => {
    if (!activeReferenceNumber || hasAppliedReferenceNumber.current) {
      return;
    }

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      const didApply = applyReferenceNumberToDocument(activeReferenceNumber);

      if (didApply || attempts >= 30) {
        hasAppliedReferenceNumber.current = didApply;
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [activeReferenceNumber]);

  const saveMemoRecord = async () => {
    if (!editorRef.current) {
      return null;
    }

    try {
      setIsSaving(true);
      const existingReferenceNumber = activeReferenceNumber;

      if (existingReferenceNumber) {
        applyReferenceNumberToDocument(existingReferenceNumber);
      }

      const savedBuffer = await editorRef.current.save();

      if (!savedBuffer) {
        throw new Error("The document could not be saved.");
      }

      const docxBase64 = arrayBufferToBase64(savedBuffer);
      const payload = {
        title: pageTitle,
        category: memoType,
        customCategory: memoType === "BLANK" ? customType || null : null,
        summary: null,
        documentName,
        docxBase64,
        recipientScope,
        recipientTargets: buildRecipientTargets(),
      };
      let savedMemo =
        activeMemoId
          ? await updateMemoMutation.mutateAsync({
              id: activeMemoId,
              payload,
            })
          : await createMemoMutation.mutateAsync(payload);
      let finalBuffer = savedBuffer;

      if (!existingReferenceNumber) {
        applyReferenceNumberToDocument(savedMemo.referenceNumber);
        const referencedBuffer = await editorRef.current.save();

        if (referencedBuffer) {
          finalBuffer = referencedBuffer;
          savedMemo = await updateMemoMutation.mutateAsync({
            id: savedMemo.id,
            payload: {
              documentName,
              docxBase64: arrayBufferToBase64(referencedBuffer),
              recipientScope,
              recipientTargets: buildRecipientTargets(),
            },
          });
        }
      }

      downloadBufferAsDocx(finalBuffer, documentName);

      toast({
        variant: "success",
        title: "Memo saved",
        description: `${savedMemo.referenceNumber} was saved and downloaded.`,
      });

      if (mode === "CREATE") {
        router.replace(`/memo-editor/${savedMemo.id}`);
      }

      return savedMemo;
    } catch (error) {
      toast({
        variant: "error",
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "The document could not be saved right now.",
      });
    } finally {
      setIsSaving(false);
    }

    return null;
  };

  const handleSave = async () => {
    await saveMemoRecord();
  };

  const handlePublish = async () => {
    if (!editorRef.current) return;

    if (!activeMemoId || !activeReferenceNumber) {
      toast({
        variant: "error",
        title: "Reference number not ready",
        description: "Wait for the memo reference number to finish generating before publishing.",
      });
      return;
    }

    if (recipientScope === "SPECIFIC" && !selectedRecipients.length) {
      toast({
        variant: "error",
        title: "TO recipients required",
        description: "Add at least one member or user before publishing.",
      });
      return;
    }

    try {
      applyReferenceNumberToDocument(activeReferenceNumber);

      const savedBuffer = await editorRef.current.save();

      if (!savedBuffer) {
        throw new Error("The document could not be saved.");
      }

      const docxBase64 = arrayBufferToBase64(savedBuffer);

      await updateMemoMutation.mutateAsync({
        id: activeMemoId,
        payload: {
          title: pageTitle,
          category: memoType,
          customCategory: memoType === "BLANK" ? customType || null : null,
          summary: null,
          documentName,
          docxBase64,
          recipientScope,
          recipientTargets: buildRecipientTargets(),
        },
      });

      const publishedMemo = await publishMemoMutation.mutateAsync({
        id: activeMemoId,
        documentName,
        docxBase64,
      });

      toast({
        variant: publishedMemo.status === "PUBLISHED" ? "success" : "warning",
        title:
          publishedMemo.status === "PUBLISHED"
            ? "Memo published"
            : "Memo published with delivery issues",
        description: `${publishedMemo.referenceNumber} was processed for ${publishedMemo.recipients.length} recipient(s).`,
      });

      router.replace("/memo-announcements");
    } catch (error) {
      toast({
        variant: "error",
        title: "Publish failed",
        description:
          error instanceof Error
            ? error.message
            : "The memo could not be published right now.",
      });
    }
  };

  const insertSignatoryIntoDocument = (signatory: MemoSignatory) => {
    const view = editorRef.current?.getEditorRef()?.getView();

    if (!view) {
      throw new Error("The editor is not ready yet.");
    }

    const { schema } = view.state;
    const paragraphNode = schema.nodes.paragraph;
    const imageNode = schema.nodes.image;

    if (!paragraphNode) {
      throw new Error("The memo editor paragraph schema is unavailable.");
    }

    const textParagraph = (
      text: string,
      options?: {
        align?: "center" | "left" | "right";
        bold?: boolean;
      },
    ) => {
      const marks = options?.bold && schema.marks.strong
        ? [schema.marks.strong.create()]
        : undefined;

      return paragraphNode.create(
        {
          alignment: options?.align ?? "left",
        },
        text ? schema.text(text, marks) : undefined,
      );
    };

    const alignedPosition = "left";

    const dividerParagraph = paragraphNode.create(
      {
        alignment: alignedPosition,
      },
      schema.text("_______________________________"),
    );

    const signatoryNodes = [
      textParagraph(""),
      textParagraph("Prepared by:", { align: alignedPosition }),
      textParagraph(""),
    ];

    if (signatory.signatureDataUrl && imageNode) {
      signatoryNodes.push(
        paragraphNode.create(
          {
            alignment: alignedPosition,
          },
          [
            imageNode.create({
              src: signatory.signatureDataUrl,
              alt: `${signatory.printedName} signature`,
              width: 150,
              height: 72,
              wrapType: "inline",
              displayMode: "inline",
            }),
          ],
        ),
      );
    }

    signatoryNodes.push(
      dividerParagraph,
      textParagraph(signatory.printedName, {
        align: alignedPosition,
        bold: true,
      }),
      textParagraph(signatory.designation, { align: alignedPosition }),
      textParagraph(""),
    );

    const paragraphs: Array<{ from: number; to: number; text: string }> = [];

    view.state.doc.descendants((node, position) => {
      if (node.type !== paragraphNode) return;

      paragraphs.push({
        from: position,
        to: position + node.nodeSize,
        text: node.textContent.trim(),
      });
    });

    const placeholderIndex = paragraphs.findIndex((paragraph) =>
      /\[Name of Authorized Signatory\]/i.test(paragraph.text),
    );
    let placeholderRange: { from: number; to: number } | null = null;

    if (placeholderIndex >= 0) {
      for (const paragraph of paragraphs.slice(placeholderIndex)) {
        const isPlaceholder =
          /\[Name of Authorized Signatory\]/i.test(paragraph.text) ||
          /\[Designation\]/i.test(paragraph.text) ||
          /\[Office \/ Department\]/i.test(paragraph.text);

        if (!isPlaceholder) break;

        const rangeFrom: number =
          placeholderRange === null ? paragraph.from : placeholderRange.from;
        placeholderRange = {
          from: rangeFrom,
          to: paragraph.to,
        };
      }
    }
    const insertPosition =
      placeholderRange?.from ?? Math.max(0, view.state.doc.content.size - 1);
    const transaction =
      placeholderRange
        ? view.state.tr.replaceWith(
            placeholderRange.from,
            placeholderRange.to,
            ProseMirrorFragment.fromArray(signatoryNodes),
          )
        : view.state.tr.insert(
            insertPosition,
            ProseMirrorFragment.fromArray(signatoryNodes),
          );

    view.dispatch(transaction.scrollIntoView());
    editorRef.current?.getEditorRef()?.focus();
  };

  const handleAddSignatory = () => {
    const normalizedPrintedName = printedNameInput.trim();
    const normalizedDesignation = designationInput.trim();

    if (!normalizedPrintedName || !normalizedDesignation) {
      return;
    }

    const signatory: MemoSignatory = {
      id: `${Date.now()}`,
      printedName: normalizedPrintedName,
      designation: normalizedDesignation,
      signatureDataUrl,
      position: "left",
    };

    try {
      insertSignatoryIntoDocument(signatory);
      setSignatories((current) => [...current, signatory]);
      setPrintedNameInput("");
      setDesignationInput("");
      setSignatureDataUrl(null);
      if (signatureCanvasRef.current) {
        const context = signatureCanvasRef.current.getContext("2d");
        context?.clearRect(
          0,
          0,
          signatureCanvasRef.current.width,
          signatureCanvasRef.current.height,
        );
      }
      setIsSignatoryDialogOpen(false);

      toast({
        variant: "success",
        title: "Signatory added",
        description: `${normalizedPrintedName} was attached to the memo document.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Unable to add signatory",
        description:
          error instanceof Error
            ? error.message
            : "The signatory block could not be inserted into the document.",
      });
    }
  };

  const recipientOptions = (recipientsQuery.data ?? []).filter(
    (option) =>
      !selectedRecipients.some(
        (recipient) =>
          recipient.type === option.type && recipient.id === option.id,
      ),
  );

  const referenceNumber = activeReferenceNumber;
  const memoStatus = memoQuery.data?.status ?? "DRAFT";

  if (isLoading || isCurrentUserLoading) {
    return (
      <section className="space-y-6 p-6">
        <PageLoadingState mode="table" />
      </section>
    );
  }

  if (loadError || !buffer) {
    return (
      <section className="space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "CREATE" ? "Create Memo" : "Update Memo"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Load the selected DOCX template and prepare the memo document in the
            browser.
          </p>
        </div>
        <PageErrorState
          title="Unable to load memo editor"
          description={
            loadError ?? "The selected memo template could not be opened."
          }
          backUrl="/memo-announcements"
          backLabel="Back to memos"
        />
      </section>
    );
  }

  return (
    <>
      <section className="memo-editor-theme flex min-h-screen flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <DocxEditor
            ref={editorRef}
            className="h-[calc(100vh-152px)]"
            documentBuffer={buffer}
            documentName={documentName}
            onDocumentNameChange={setDocumentName}
            showToolbar
            showRuler
            showZoomControl
            showPrintButton={false}
            mode="editing"
            author={currentUser?.name}
            renderLogo={() => (
              <Image
                src="/main/logo.png"
                alt="Pearl of the Orient"
                width={30}
                height={30}
                className="size-10 rounded-sm object-cover"
              />
            )}
            renderTitleBarRight={() => (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden xl:inline-flex">
                  {referenceNumber ? `Ref. No. ${referenceNumber}` : "Ref. No. pending"}
                </Badge>
                <Badge variant="secondary" className="hidden xl:inline-flex">
                  {memoStatus}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRecipientDialogOpen(true)}
                >
                  <UserPlus className="size-4" />
                  Recipient ({recipientScope === "SPECIFIC" ? selectedRecipients.length : recipientScope.toLowerCase()})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSignatoryDialogOpen(true)}
                >
                  <Signature className="size-4" />
                  Add signatory
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={
                    isSaving ||
                    createMemoMutation.isPending ||
                    updateMemoMutation.isPending
                  }
                >
                  {isSaving || createMemoMutation.isPending || updateMemoMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isSaving || createMemoMutation.isPending || updateMemoMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handlePublish()}
                  disabled={
                    publishMemoMutation.isPending ||
                    updateMemoMutation.isPending ||
                    isSaving ||
                    !activeMemoId ||
                    !activeReferenceNumber
                  }
                >
                  {publishMemoMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {publishMemoMutation.isPending ? "Publishing..." : "Publish"}
                </Button>
              </div>
            )}
          />
        </div>
      </section>

      <Dialog
        open={isRecipientDialogOpen}
        onOpenChange={setIsRecipientDialogOpen}
      >
        <DialogContent className="max-w-6xl!">
          <DialogHeader>
            <DialogTitle>Memo Recipients</DialogTitle>
            <DialogDescription>
              Choose who will receive the memo soft copy when published.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <RadioGroup
              value={recipientScope}
              onValueChange={(value) =>
                setRecipientScope(value as MemoRecipientScope)
              }
              className="grid gap-3 md:grid-cols-3"
            >
              {[
                {
                  value: "ALL",
                  title: "All",
                  description: "All active approved members",
                },
                {
                  value: "OFFICERS",
                  title: "Officers",
                  description: "Approved members with active office assignments",
                },
                {
                  value: "SPECIFIC",
                  title: "Specific",
                  description: "Only selected approved members",
                },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`recipient-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
                    recipientScope === option.value && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem
                    id={`recipient-${option.value}`}
                    value={option.value}
                    className="mt-1"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">
                      {option.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>

            {recipientScope === "SPECIFIC" ? (
              <div className="space-y-3">
                <Command shouldFilter={false} className="rounded-lg border">
                  <CommandInput
                    value={recipientSearch}
                    onValueChange={setRecipientSearch}
                    placeholder="Search approved member..."
                  />
                  <CommandList>
                    <CommandGroup>
                      {recipientsQuery.isLoading ? (
                        <div className="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
                          <LoaderCircle className="size-4 animate-spin" />
                          Searching recipients...
                        </div>
                      ) : recipientOptions.length ? (
                        recipientOptions.map((option) => (
                          <CommandItem
                            key={`${option.type}-${option.id}`}
                            value={`${option.name} ${option.email}`}
                            onSelect={() => {
                              setSelectedRecipients((current) => [
                                ...current,
                                option,
                              ]);
                              setRecipientSearch("");
                            }}
                          >
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">
                                {option.name}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {option.email} - {option.label}
                              </span>
                            </div>
                            <Check className="size-4 opacity-0" />
                          </CommandItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No approved member found.
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>

                <div className="flex min-h-9 flex-wrap gap-2">
                  {selectedRecipients.length ? (
                    selectedRecipients.map((recipient) => (
                      <Badge
                        key={`${recipient.type}-${recipient.id}`}
                        variant="outline"
                        className="max-w-full gap-1.5 px-2 py-1"
                      >
                        <span className="truncate">
                          {recipient.name} - {recipient.email}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRecipients((current) =>
                              current.filter(
                                (item) =>
                                  item.type !== recipient.type ||
                                  item.id !== recipient.id,
                              ),
                            )
                          }
                          aria-label={`Remove ${recipient.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No specific recipients selected.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsRecipientDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSignatoryDialogOpen}
        onOpenChange={setIsSignatoryDialogOpen}
      >
        <DialogContent className="max-w-xl!">
          <DialogHeader>
            <DialogTitle>Add Signatory</DialogTitle>
            <DialogDescription>
              Capture the signature, enter the printed name and designation,
              then attach the signatory block to this memo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="printed-name">Printed name</Label>
              <Input
                id="printed-name"
                value={printedNameInput}
                onChange={(event) => setPrintedNameInput(event.target.value)}
                placeholder="Example: Bishop Elias Monteverde"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Signatory / designation</Label>
              <Input
                id="designation"
                value={designationInput}
                onChange={(event) => setDesignationInput(event.target.value)}
                placeholder="Example: National Chaplain"
              />
            </div>

            <div className="space-y-2">
              <Label>Signature</Label>
              <SignatureInput
                canvasRef={signatureCanvasRef}
                onSignatureChange={setSignatureDataUrl}
              />
              <p className="text-muted-foreground text-xs">
                Draw the signature here. It will be inserted into the document
                above the printed name.
              </p>
            </div>

            {signatories.length ? (
              <div className="space-y-2">
                <Label>Current signatories</Label>
                <div className="flex flex-wrap gap-2">
                  {signatories.map((signatory) => (
                    <span
                      key={signatory.id}
                      className="rounded-full border bg-accent px-3 py-1 text-xs"
                    >
                      {signatory.printedName} - {signatory.designation}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignatoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSignatory}
              disabled={!printedNameInput.trim() || !designationInput.trim()}
            >
              Add signatory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .memo-editor-theme .ep-root {
          --primary: 138 60% 20%;
          --primary-foreground: 0 0% 100%;
          --ring: 138 60% 20%;
          --doc-primary: #145224;
          --doc-primary-hover: #0f401b;
          --doc-primary-light: rgba(20, 82, 36, 0.12);
          --doc-link: #145224;
        }

        .memo-editor-theme .docx-run ::selection,
        .memo-editor-theme .docx-run-editable ::selection,
        .memo-editor-theme .docx-run-editable::selection,
        .memo-editor-theme .docx-run::selection,
        .memo-editor-theme [contenteditable="true"] ::selection,
        .memo-editor-theme [contenteditable="true"]::selection,
        .memo-editor-theme .docx-paragraph ::selection,
        .memo-editor-theme .docx-paragraph-editable ::selection,
        .memo-editor-theme .docx-paragraph-editable::selection,
        .memo-editor-theme .docx-paragraph::selection,
        .memo-editor-theme .docx-hyperlink ::selection,
        .memo-editor-theme .docx-hyperlink::selection,
        .memo-editor-theme .docx-run-bold ::selection,
        .memo-editor-theme .docx-run-bold::selection,
        .memo-editor-theme .docx-run-italic ::selection,
        .memo-editor-theme .docx-run-italic::selection {
          background-color: rgba(20, 82, 36, 0.28) !important;
        }

        .memo-editor-theme .docx-run-highlighted ::selection,
        .memo-editor-theme .docx-run-highlighted::selection {
          background-color: rgba(20, 82, 36, 0.4) !important;
        }

        .memo-editor-theme .docx-selection-overlay-rect {
          background-color: rgba(20, 82, 36, 0.22);
        }

        .memo-editor-theme .layout-table-cell-selected {
          outline-color: rgba(20, 82, 36, 0.55);
        }

        .memo-editor-theme .layout-table-cell-selected:after {
          background-color: rgba(20, 82, 36, 0.12);
        }

        .memo-editor-theme .layout-table-resize-handle.dragging,
        .memo-editor-theme .layout-table-resize-handle:hover,
        .memo-editor-theme .layout-table-edge-handle-bottom.dragging,
        .memo-editor-theme .layout-table-edge-handle-bottom:hover,
        .memo-editor-theme .layout-table-row-resize-handle.dragging,
        .memo-editor-theme .layout-table-row-resize-handle:hover,
        .memo-editor-theme .layout-table-edge-handle-right.dragging,
        .memo-editor-theme .layout-table-edge-handle-right:hover {
          background-color: rgba(20, 82, 36, 0.55);
        }

        .memo-editor-theme .layout-page-footer:hover,
        .memo-editor-theme .layout-page-header:hover {
          background-color: rgba(20, 82, 36, 0.06);
        }

        .memo-editor-theme .paged-editor--editing-header .layout-page-header {
          border-bottom-color: #145224;
        }

        .memo-editor-theme .paged-editor--editing-footer .layout-page-footer {
          border-top-color: #145224;
        }

        .memo-editor-theme [data-testid="title-bar"] input[aria-label="Document name"] {
          width: min(44rem, 60vw);
          max-width: min(44rem, 60vw);
        }

        .memo-editor-theme [data-testid="editor-toolbar"] {
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 1px 0 hsl(var(--border));
        }

        .memo-editor-theme img[alt$=" signature"] {
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          .memo-editor-theme,
          .memo-editor-theme .ep-root,
          .memo-editor-theme .docx-editor,
          .memo-editor-theme .docx-editor-content,
          .memo-editor-theme .paged-editor,
          .memo-editor-theme .paged-editor__container,
          .memo-editor-theme .paged-editor__pages,
          .memo-editor-theme .layout-page,
          .memo-editor-theme .layout-page * {
            visibility: visible !important;
          }

          .memo-editor-theme {
            display: block !important;
            min-height: auto !important;
            background: #ffffff !important;
          }

          .memo-editor-theme [data-testid="title-bar"],
          .memo-editor-theme [data-testid="editor-toolbar"],
          .memo-editor-theme .docx-horizontal-ruler,
          .memo-editor-theme .docx-vertical-ruler,
          .memo-editor-theme .paged-editor__plugin-overlays,
          .memo-editor-theme .docx-table-toolbar,
          .memo-editor-theme .docx-text-context-menu,
          .memo-editor-theme .layout-table-resize-handle,
          .memo-editor-theme .layout-table-row-resize-handle,
          .memo-editor-theme .layout-table-edge-handle-bottom,
          .memo-editor-theme .layout-table-edge-handle-right {
            display: none !important;
          }

          .memo-editor-theme .flex-1,
          .memo-editor-theme .overflow-hidden,
          .memo-editor-theme .ep-root,
          .memo-editor-theme .docx-editor,
          .memo-editor-theme .docx-editor-content,
          .memo-editor-theme .paged-editor,
          .memo-editor-theme .paged-editor__container,
          .memo-editor-theme .paged-editor__pages {
            display: block !important;
            height: auto !important;
            min-height: auto !important;
            width: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .memo-editor-theme .layout-page {
            display: block !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 0 !important;
            break-after: page;
            page-break-after: always;
            page-break-inside: avoid;
          }

          .memo-editor-theme .layout-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        }
      `}</style>
    </>
  );
}
