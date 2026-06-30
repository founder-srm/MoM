import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-24 w-full min-w-0 border-b-2 border-border bg-transparent px-0 text-4xl font-bold uppercase tracking-tighter text-foreground outline-none placeholder:text-muted placeholder:opacity-50 focus-visible:border-primary transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
