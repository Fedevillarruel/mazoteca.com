import * as React from "react";
import { cn } from "@/lib/utils";

// ---- Card Container ----

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "bordered" | "interactive";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          {
            default: "bg-surface-900 border border-surface-800",
            elevated: "bg-surface-900 border border-surface-800 shadow-elevated",
            glass: "glass",
            bordered: "bg-surface-900/50 border border-surface-700",
            interactive:
              "bg-surface-900 border border-surface-800 card-hover cursor-pointer hover:border-surface-700",
          }[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// ---- Card Header ----

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 pb-0", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ---- Card Title ----

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-surface-50",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ---- Card Description ----

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-surface-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ---- Card Content ----

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ---- Card Footer ----

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
