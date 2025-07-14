import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white hover:shadow-md hover:brightness-110",
        destructive: "bg-gradient-to-r from-[#ff5e5e] to-[#ff3737] text-white hover:shadow-md",
        outline: "border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20",
        secondary: "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20",
        ghost: "hover:bg-white/10 text-white",
        link: "text-white underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white hover:shadow-md hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }