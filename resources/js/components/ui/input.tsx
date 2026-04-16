import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Aged oak field
        "flex h-10 w-full min-w-0 rounded border border-border bg-card",
        "px-3 py-2 text-base text-foreground",
        "font-body placeholder:text-muted-foreground placeholder:italic",
        "transition-all duration-300 outline-none",
        // Focus — brass ring
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        // File input
        "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-display file:font-medium",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // Invalid
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
