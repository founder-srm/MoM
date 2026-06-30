import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full border-2 border-border bg-transparent p-4 text-lg text-foreground outline-none placeholder:text-muted placeholder:opacity-50 focus-visible:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
