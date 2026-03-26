"use client";

import { DocxEditor, type DocxEditorRef } from "@eigenpal/docx-js-editor";
import "@eigenpal/docx-js-editor/styles.css";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Fragment as ProseMirrorFragment } from "prosemirror-model";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  Printer,
  Save,
  Signature,
} from "lucide-react";

import { PageErrorState } from "@/components/PageErrorState";
import { PageLoadingState } from "@/components/PageLoadingState";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery } from "@/features/auth/auth.hooks";

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
  const [isSignatoryDialogOpen, setIsSignatoryDialogOpen] = useState(false);
  const [printedNameInput, setPrintedNameInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatoryPosition, setSignatoryPosition] = useState<
    "left" | "center" | "right"
  >("right");
  const [signatories, setSignatories] = useState<MemoSignatory[]>([]);
  const [documentName, setDocumentName] = useState("Untitled Memo.docx");
  const hasInitializedDocumentName = useRef(false);
  const documentTimestampRef = useRef(buildMemoDocumentTimestamp(new Date()));
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const mode = memoId === "create" ? "CREATE" : "UPDATE";
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

  const handleSave = async () => {
    if (!editorRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      const savedBuffer = await editorRef.current.save();

      if (!savedBuffer) {
        throw new Error("The document could not be saved.");
      }

      downloadBufferAsDocx(savedBuffer, documentName);

      toast({
        variant: "success",
        title: "Memo saved",
        description:
          "The current document was exported as a .docx file for frontend testing.",
      });
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
  };

  const handlePrint = () => {
    window.print();
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

    const alignedPosition =
      signatory.position === "center"
        ? "center"
        : signatory.position === "left"
          ? "left"
          : "right";

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

    const insertPosition = view.state.selection.to;
    const transaction = view.state.tr.insert(
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
      position: signatoryPosition,
    };

    try {
      insertSignatoryIntoDocument(signatory);
      setSignatories((current) => [...current, signatory]);
      setPrintedNameInput("");
      setDesignationInput("");
      setSignatureDataUrl(null);
      setSignatoryPosition("right");
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
                  onClick={() => setIsSignatoryDialogOpen(true)}
                >
                  <Signature className="size-4" />
                  Add signatory
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint}>
                  <Printer className="size-4" />
                  Print
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          />
        </div>
      </section>

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
              <Label htmlFor="signatory-position">Block position</Label>
              <Select
                value={signatoryPosition}
                onValueChange={(value) =>
                  setSignatoryPosition(value as "left" | "center" | "right")
                }
              >
                <SelectTrigger id="signatory-position" className="w-full">
                  <SelectValue placeholder="Choose a signatory position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left aligned</SelectItem>
                  <SelectItem value="center">Centered</SelectItem>
                  <SelectItem value="right">Right aligned</SelectItem>
                </SelectContent>
              </Select>
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
                      {signatory.printedName} · {signatory.designation} ·{" "}
                      {signatory.position}
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
      `}</style>
    </>
  );
}
