import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center rounded border px-2 py-0.5",
    "font-display text-[10px] uppercase tracking-[0.12em] w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-primary/15 text-primary",
        secondary:
          "border-destructive/50 bg-destructive/15 text-primary",
        destructive:
          "border-destructive/60 bg-destructive/20 text-foreground",
        outline:
          "border-border bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
