/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import SignatureInput from "@/components/ui/signature-input";
import { Field } from "../Field";
import type { ApplicationFormState } from "../types";
import {
  readImageFileAsOptimizedDataUrl,
  sanitizeMobileNumber,
} from "../utils";

const PHONE_PATTERN = "09[0-9]{9}";

export function StepReferencesReview({
  form,
  updateFieldAction,
  handleSignatureChangeAction,
}: {
  form: ApplicationFormState;
  updateFieldAction: <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) => void;
  handleSignatureChangeAction: (signature: string | null) => void;
}) {
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const endorsedBy = form.characterReferences[0] ?? {
    name: "",
    position: "",
    contactNumber: "",
  };

  useEffect(() => {
    if (!form.signatureUrl.startsWith("data:image")) return;

    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 200;

    if (form.signatureUrl === canvas.toDataURL()) {
      handleSignatureChangeAction(null);
    }
  }, [form.signatureUrl, handleSignatureChangeAction]);

  useEffect(() => {
    if (form.characterReferences.length === 1) return;
    updateFieldAction("characterReferences", [endorsedBy]);
  }, [endorsedBy, form.characterReferences.length, updateFieldAction]);

  const handleSignatureUploadAction = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const signatureDataUrl = await readImageFileAsOptimizedDataUrl(file);
      handleSignatureChangeAction(signatureDataUrl);
    } catch {
      // Keep the current signature if file reading fails.
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="font-serif text-base text-foreground sm:text-lg">
          Must be endorsed by a Chaplain
        </h3>
        <p className="text-xs text-foreground/70 sm:text-sm">
          Please provide one person who endorses your application.
        </p>
        <div className="grid gap-3 rounded-lg border border-dashed border-foreground/20 px-3 py-3 sm:grid-cols-3">
          <Field label="Name" required>
            <Input
              value={endorsedBy.name}
              onChange={(event) => {
                updateFieldAction("characterReferences", [
                  { ...endorsedBy, name: event.target.value },
                ]);
              }}
              placeholder="Full name"
            />
          </Field>
          <Field label="Relationship" required>
            <Input
              value={endorsedBy.position}
              onChange={(event) => {
                updateFieldAction("characterReferences", [
                  { ...endorsedBy, position: event.target.value },
                ]);
              }}
              placeholder="e.g. Senior Pastor"
            />
          </Field>
          <Field label="Contact number" required>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              pattern={PHONE_PATTERN}
              value={endorsedBy.contactNumber}
              onChange={(event) => {
                updateFieldAction("characterReferences", [
                  {
                    ...endorsedBy,
                    contactNumber: sanitizeMobileNumber(event.target.value),
                  },
                ]);
              }}
              placeholder="e.g. 09152479693"
            />
          </Field>
        </div>

        <Field
          label="Applicant's signature"
          hint="Use your mouse, trackpad, or finger to sign inside the box."
        >
          <div className="mt-1 space-y-3">
            <div className="inline-flex rounded-md border border-primary/20 p-1">
              <button
                type="button"
                onClick={() => setSignatureMode("draw")}
                className={[
                  "rounded px-3 py-1 text-xs transition-colors sm:text-sm",
                  signatureMode === "draw"
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-primary/10",
                ].join(" ")}
              >
                Draw signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode("upload")}
                className={[
                  "rounded px-3 py-1 text-xs transition-colors sm:text-sm",
                  signatureMode === "upload"
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-primary/10",
                ].join(" ")}
              >
                Upload e-signature
              </button>
            </div>

            {signatureMode === "draw" ? (
              <SignatureInput onSignatureChange={handleSignatureChangeAction} />
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUploadAction}
                  className="max-w-105"
                />
                <p className="text-[10px] text-primary/70 sm:text-xs">
                  Upload a transparent PNG or clear image of your signature.
                </p>
                {form.signatureUrl ? (
                  <div className="max-w-105 overflow-hidden rounded-md border border-primary/20 bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.signatureUrl}
                      alt="Uploaded e-signature preview"
                      className="h-auto max-h-45 w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {form.signatureUrl ? (
              <p className="mt-1 text-[10px] text-foreground/70 sm:text-xs">
                {signatureMode === "upload"
                  ? "E-signature attached."
                  : "Signature captured. You may clear and redraw if needed."}
              </p>
            ) : null}
          </div>
        </Field>
      </div>
    </div>
  );
}
