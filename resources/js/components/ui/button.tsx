import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium text-[13px] tracking-normal",
    "transition-all duration-200 ease-out",
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
          "shadow-[0_10px_30px_-16px_color-mix(in_srgb,var(--foreground)_28%,transparent)]",
          "hover:-translate-y-px hover:brightness-[1.08] hover:shadow-[0_14px_36px_-18px_color-mix(in_srgb,var(--foreground)_36%,transparent)]",
        ].join(" "),
        secondary: [
          "border border-border bg-transparent text-foreground",
          "hover:border-foreground hover:bg-muted",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[0_10px_30px_-16px_color-mix(in_srgb,var(--destructive)_40%,transparent)]",
          "hover:-translate-y-px hover:brightness-[1.08]",
        ].join(" "),
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:border-primary hover:text-primary hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]",
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
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-4 py-1 text-[11px]",
        lg:      "h-12 px-7 py-3 text-sm",
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
