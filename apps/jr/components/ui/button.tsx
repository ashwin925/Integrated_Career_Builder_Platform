"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "default";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles =
      "relative px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none disabled:opacity-50";

    const variants: Record<string, string> = {
      default: "bg-gray-700 text-white hover:bg-gray-600",
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-danger",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
