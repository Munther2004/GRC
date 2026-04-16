import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded",
    "font-display text-xs uppercase tracking-[0.15em]",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)]",
          "hover:brightness-110 hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_35%,transparent)]",
        ].join(" "),
        secondary: [
          "border-2 border-primary bg-transparent text-primary",
          "hover:border-destructive hover:bg-destructive hover:text-destructive-foreground",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]",
          "hover:brightness-110",
        ].join(" "),
        outline: [
          "border border-border bg-transparent text-muted-foreground",
          "hover:border-primary hover:text-primary hover:bg-muted",
        ].join(" "),
        ghost: [
          "bg-transparent text-muted-foreground",
          "hover:text-foreground hover:bg-muted",
        ].join(" "),
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline",
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
