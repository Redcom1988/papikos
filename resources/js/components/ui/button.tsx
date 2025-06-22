import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90",
        outline:
          "border border-border bg-background text-foreground shadow-sm hover:bg-muted hover:text-muted-foreground dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted dark:hover:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
        ghost: 
          "text-foreground hover:bg-muted hover:text-muted-foreground dark:text-foreground dark:hover:bg-muted dark:hover:text-muted-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline dark:text-primary",
        custom: "", // Empty variant for full customization
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  customColor,
  customHover,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    customColor?: string
    customHover?: string
  }) {
  const Comp = asChild ? Slot : "button"

  // Build custom styles when customColor or customHover are provided
  const customStyles = React.useMemo(() => {
    const baseStyle = style || {}

    if (customColor || customHover) {
      return {
        ...baseStyle,
        ...(customColor && { backgroundColor: customColor }),
        // Add CSS custom properties for hover states
        ...(customHover && { "--custom-hover-color": customHover }),
      } as React.CSSProperties & { "--custom-hover-color"?: string }
    }

    return baseStyle
  }, [style, customColor, customHover])

  // When using custom colors, automatically switch to custom variant if not specified
  const effectiveVariant = (customColor || customHover) && !variant ? "custom" : variant

  // Build custom hover classes
  const customHoverClass = customHover ? "hover:[background-color:var(--custom-hover-color)]" : ""

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant: effectiveVariant, size, className }),
        customHoverClass
      )}
      style={customStyles}
      {...props}
    />
  )
}

export { Button, buttonVariants }
