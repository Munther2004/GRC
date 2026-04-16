import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — Cinzel display font, uppercase, engraved feel
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded",
    "font-display text-xs uppercase tracking-[0.15em]",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-[#408A71] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091413]",
    "active:scale-[0.98]",
    "text-engraved",
  ].join(" "),
  {
    variants: {
      variant: {
        // Polished brass — primary call to action
        default: [
          "bg-brass text-[#091413]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.3)]",
          "hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_12px_rgba(64,138,113,0.35)]",
        ].join(" "),
        // Outlined brass → transforms to crimson on hover
        secondary: [
          "border-2 border-[#408A71] bg-transparent text-[#408A71]",
          "hover:border-[#8B2635] hover:bg-[#8B2635] hover:text-[#E0F5EC]",
        ].join(" "),
        // Library Crimson — destructive actions
        destructive: [
          "bg-[#8B2635] text-[#E0F5EC]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]",
          "hover:bg-[#A02D40] hover:shadow-[0_4px_12px_rgba(139,38,53,0.4)]",
        ].join(" "),
        // Subtle outlined — secondary actions
        outline: [
          "border border-[#285A48] bg-transparent text-[#7ABFA8]",
          "hover:border-[#408A71] hover:text-[#408A71] hover:bg-[#122B22]",
        ].join(" "),
        // Ghost — minimal tertiary actions
        ghost: [
          "bg-transparent text-[#7ABFA8]",
          "hover:text-[#408A71] hover:bg-[#122B22]",
        ].join(" "),
        // Link — brass underline
        link: [
          "bg-transparent text-[#408A71] underline-offset-4",
          "hover:underline hover:text-[#B0E4CC]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-8 px-4 py-1 text-[10px]",
        lg:      "h-12 px-8 py-2.5",
        icon:    "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
