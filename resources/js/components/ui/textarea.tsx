import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        // Aged oak textarea
        "flex min-h-[100px] w-full rounded border border-[#4A3F35] bg-[#251E19]",
        "px-3 py-2.5 text-base text-[#E8DFD4]",
        "font-body placeholder:text-[#9C8B7A] placeholder:italic",
        "resize-y transition-all duration-300 outline-none",
        // Focus — brass ring
        "focus-visible:border-[#C9A962] focus-visible:ring-2 focus-visible:ring-[#C9A962]/25 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1C1714]",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
