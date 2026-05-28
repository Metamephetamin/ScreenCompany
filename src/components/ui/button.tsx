import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "secondary" && "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
        variant === "ghost" && "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100",
        variant === "danger" && "border-red-700 bg-red-700 text-white hover:bg-red-800",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-10 px-4",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
}
