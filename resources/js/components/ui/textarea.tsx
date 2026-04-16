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
        "flex min-h-[100px] w-full rounded border border-[#285A48] bg-[#0D1F1C]",
        "px-3 py-2.5 text-base text-[#E0F5EC]",
        "font-body placeholder:text-[#7ABFA8] placeholder:italic",
        "resize-y transition-all duration-300 outline-none",
        // Focus — brass ring
        "focus-visible:border-[#408A71] focus-visible:ring-2 focus-visible:ring-[#408A71]/25 focus-visible:ring-offset-1 focus-visible:ring-offset-[#091413]",
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
