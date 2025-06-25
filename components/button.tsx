import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "accent"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantClasses = {
      default: "bg-[#00A8A8] text-white hover:bg-[#009494]",
      outline: "border border-[#00A8A8] bg-white text-[#2B2D42] hover:bg-[#D8F5F5]",
      ghost: "text-[#2B2D42] hover:bg-[#D8F5F5]",
      secondary: "bg-[#D8F5F5] text-[#2B2D42] hover:bg-[#c5e8e8]",
      accent: "bg-[#3B3B98] text-white hover:bg-[#323280]",
    }

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-11 px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} ref={ref} {...props} />
    )
  },
)

Button.displayName = "Button"

export { Button }
