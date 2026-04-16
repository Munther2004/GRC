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
        // Brass — default emphasis
        default:
          "border-[#C9A962]/50 bg-[#C9A962]/15 text-[#C9A962]",
        // Crimson — secondary/special
        secondary:
          "border-[#8B2635]/50 bg-[#8B2635]/15 text-[#C9A962]",
        // Crimson — destructive
        destructive:
          "border-[#8B2635]/60 bg-[#8B2635]/20 text-[#E8DFD4]",
        // Outlined — subtle
        outline:
          "border-[#4A3F35] bg-transparent text-[#9C8B7A]",
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
