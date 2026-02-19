"use client"

import { memo, useEffect, useState, type ComponentProps } from "react"
import { Streamdown } from "streamdown"

import { cn } from "@/lib/utils"

type ResponseProps = ComponentProps<typeof Streamdown>

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

Response.displayName = "Response"

const DEFAULT_STREAM_DELAY_MS = 20

export type StreamingResponseProps = {
  /** Full content to reveal character-by-character */
  content: string
  /** Delay in ms between each character (default 20) */
  delayMs?: number
  className?: string
}

/** Renders AI response with character-by-character streaming into the Response (markdown) component. */
export const StreamingResponse = memo(function StreamingResponse({
  content,
  delayMs = DEFAULT_STREAM_DELAY_MS,
  className,
}: StreamingResponseProps) {
  const [visibleContent, setVisibleContent] = useState("")

  useEffect(() => {
    if (!content) {
      setVisibleContent("")
      return
    }
    setVisibleContent("")
    let index = 0
    const interval = setInterval(() => {
      if (index < content.length) {
        setVisibleContent((prev) => content.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, delayMs)
    return () => clearInterval(interval)
  }, [content, delayMs])

  return (
    <Response className={className}>{visibleContent}</Response>
  )
})
