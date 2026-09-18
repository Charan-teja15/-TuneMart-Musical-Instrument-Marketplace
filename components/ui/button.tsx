import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#0F0F12] text-white hover:bg-black shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-[#E7E5E4] bg-white hover:bg-[#F5F5F4] hover:text-[#0F0F12]",
        secondary: "bg-[#F3F1EB] text-[#0F0F12] hover:bg-[#EDE9E0]",
        ghost: "hover:bg-[#F5F5F4] hover:text-[#0F0F12]",
        link: "text-[#0F0F12] underline-offset-4 hover:underline",
        accent: "bg-[#FF6B00] text-white hover:bg-[#E55F00] shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
