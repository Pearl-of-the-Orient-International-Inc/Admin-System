"use client";

import { useMemo, useRef } from "react";
import { all, createLowlight } from "lowlight";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(all);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Type definitions for hast (HTML Abstract Syntax Tree) nodes
interface HastTextNode {
  type: "text";
  value: string;
}

interface HastElementNode {
  type: "element";
  tagName: string;
  properties?: {
    className?: string | string[];
    [key: string]: unknown;
  };
  children?: HastNode[];
}

interface HastRoot {
  type: "root";
  children: HastNode[];
}

type HastNode = string | HastTextNode | HastElementNode | HastRoot;

// Simple function to convert hast tree to HTML string
const hastToHtml = (node: unknown): string => {
  if (typeof node === "string") {
    return node;
  }
  if (!node || typeof node !== "object") {
    return "";
  }
  const nodeObj = node as Record<string, unknown>;
  if (nodeObj.type === "text") {
    return (nodeObj.value as string) || "";
  }
  if (nodeObj.type === "element") {
    const tag = (nodeObj.tagName as string) || "span";
    const props = (nodeObj.properties as Record<string, unknown>) || {};
    const className = props.className
      ? ` class="${Array.isArray(props.className) ? props.className.join(" ") : props.className}"`
      : "";
    const children = (nodeObj.children as HastNode[]) || [];
    const childrenHtml = children.map((child) => hastToHtml(child)).join("");
    return `<${tag}${className}>${childrenHtml}</${tag}>`;
  }
  if ("children" in nodeObj && Array.isArray(nodeObj.children)) {
    return (nodeObj.children as HastNode[])
      .map((child) => hastToHtml(child))
      .join("");
  }
  return "";
};

// Function to pretty-print HTML with indentation
const formatHTML = (html: string): string => {
  if (!html) return "";

  // Remove existing whitespace between tags but preserve text content
  html = html.replace(/>\s+</g, "><").trim();

  let formatted = "";
  let indent = 0;
  const indentSize = 2;
  // Tags that should be inline (no extra indentation for content)
  const inlineTags = new Set(["p", "span", "strong", "em", "b", "i", "u", "a", "code", "mark", "small", "sub", "sup"]);
  // Self-closing tags
  const selfClosingTags = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"]);

  let i = 0;
  const len = html.length;

  while (i < len) {
    if (html[i] === "<") {
      const tagEnd = html.indexOf(">", i);
      if (tagEnd === -1) {
        // Malformed tag, just add the rest
        formatted += html.substring(i);
        break;
      }

      const fullTag = html.substring(i, tagEnd + 1);
      const tagMatch = fullTag.match(/<\/?(\w+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
      const isClosing = fullTag.startsWith("</");
      const isSelfClosing = selfClosingTags.has(tagName) || fullTag.endsWith("/>");
      const isBlockTag = !inlineTags.has(tagName) && !isSelfClosing;

      // Decrease indent before closing tag
      if (isClosing && isBlockTag) {
        indent = Math.max(0, indent - indentSize);
      }

      // Add newline and indent before tag
      if (formatted && !formatted.endsWith("\n")) {
        formatted += "\n";
      }
      formatted += " ".repeat(indent) + fullTag;

      // Increase indent after opening tag (but not for inline tags or self-closing)
      if (!isClosing && !isSelfClosing && isBlockTag) {
        indent += indentSize;
      }

      i = tagEnd + 1;
    } else {
      // Text content
      const nextTag = html.indexOf("<", i);
      if (nextTag === -1) {
        // No more tags, add remaining text
        const text = html.substring(i).trim();
        if (text) {
          if (formatted && !formatted.endsWith("\n")) {
            formatted += "\n";
          }
          formatted += " ".repeat(indent) + text;
        }
        break;
      }

      // Extract text between current position and next tag
      const text = html.substring(i, nextTag).trim();
      if (text) {
        // Only add newline if we're not already at the start of a line
        if (formatted && !formatted.endsWith("\n")) {
          formatted += "\n";
        }
        formatted += " ".repeat(indent) + text;
      }
      i = nextTag;
    }
  }

  return formatted.trim();
};

export const CodeEditor = ({
  value,
  onChange,
  placeholder = "HTML content...",
  className,
}: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Format HTML for display
  const formattedValue = useMemo(() => {
    return formatHTML(value || "");
  }, [value]);

  const highlighted = useMemo(() => {
    try {
      const result = lowlight.highlight(formattedValue, "html");
      // Convert hast tree to HTML string
      return hastToHtml(result);
    } catch {
      // Fallback: escape HTML
      return formattedValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [formattedValue]);

  // Calculate line count based on formatted HTML
  const lineCount = useMemo(() => {
    const lines = formattedValue.split("\n").length;
    return lines || 1;
  }, [formattedValue]);

  const handleChange = (newValue: string) => {
    // When user edits, we work with the formatted version
    // But we need to handle the change properly
    onChange(newValue);
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current && lineNumbersRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollTop = scrollTop;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div className={cn("relative w-full border-t border-input bg-background", className)}>
      <div className="relative min-h-125 overflow-hidden flex">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="shrink-0 w-12 bg-muted/50 border-r border-input overflow-auto text-right select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="p-4 font-mono text-xs text-muted-foreground leading-relaxed">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="h-6">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="relative flex-1 min-h-125 overflow-hidden">
          <pre
            ref={preRef}
            className="absolute inset-0 overflow-auto p-4 pl-2 font-mono text-sm leading-relaxed pointer-events-none whitespace-pre-wrap wrap-break-word bg-background"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            aria-hidden="true"
          >
            <code
              className="block text-foreground hljs"
              dangerouslySetInnerHTML={{ __html: highlighted || (formattedValue ? formattedValue.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "") }}
            />
          </pre>
          <textarea
            ref={textareaRef}
            value={formattedValue}
            onChange={(e) => handleChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={placeholder}
            className="absolute inset-0 w-full h-full p-4 pl-2 font-mono text-sm leading-relaxed bg-transparent text-transparent resize-none outline-none border-none overflow-auto whitespace-pre-wrap wrap-break-word caret-foreground"
            spellCheck={false}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          />
        </div>
      </div>
    </div>
  );
};
