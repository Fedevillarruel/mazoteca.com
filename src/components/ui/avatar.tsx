import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ---- Avatar ----

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

const sizePixels = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function Avatar({ className, size = "md", children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---- Avatar Image ----

interface AvatarImageProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

function AvatarImage({ className, alt, src, size = "md" }: AvatarImageProps) {
  return (
    <Image
      className={cn("aspect-square h-full w-full object-cover", className)}
      alt={alt}
      src={src}
      width={sizePixels[size]}
      height={sizePixels[size]}
    />
  );
}

// ---- Avatar Fallback ----

type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary-600 text-white font-semibold",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
