import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0F0F12] text-white",
        secondary: "border-transparent bg-[#F3F1EB] text-[#0F0F12]",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "text-foreground border-[#E7E5E4]",
        accent: "border-transparent bg-[#FF6B00] text-white",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
