import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Aged oak field
        "flex h-10 w-full min-w-0 rounded border border-[#285A48] bg-[#0D1F1C]",
        "px-3 py-2 text-base text-[#E0F5EC]",
        "font-body placeholder:text-[#7ABFA8] placeholder:italic",
        "transition-all duration-300 outline-none",
        // Focus — brass ring
        "focus-visible:border-[#408A71] focus-visible:ring-2 focus-visible:ring-[#408A71]/25 focus-visible:ring-offset-1 focus-visible:ring-offset-[#091413]",
        // File input
        "file:text-[#E0F5EC] file:border-0 file:bg-transparent file:text-sm file:font-display file:font-medium",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // Invalid
        "aria-invalid:border-[#8B2635] aria-invalid:ring-[#8B2635]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
