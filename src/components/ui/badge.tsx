import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-bold uppercase tracking-widest text-xs transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground px-3 py-1",
        secondary: "bg-secondary text-secondary-foreground px-3 py-1",
        destructive: "bg-destructive/10 text-destructive px-3 py-1",
        outline: "border-2 border-border text-foreground px-3 py-1",
        ghost: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
