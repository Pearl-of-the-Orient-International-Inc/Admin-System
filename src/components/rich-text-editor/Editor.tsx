"use client";

import {useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import { MenuBar } from "./MenuBar";
import { AIGeneratePopover } from "./AIGeneratePopover";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Type any text here...",
}: RichTextEditorProps = {}) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "max-w-none min-h-[125px] focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== value) {
        editor.commands.setContent(value || "", { emitUpdate: false });
        // Reset edited value when prop changes - done via onUpdate callback
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          className="max-h-70 overflow-y-auto"
        />
        <AIGeneratePopover editor={editor} />
      </div>
    </div>
  );
};
