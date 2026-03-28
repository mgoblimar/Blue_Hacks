import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-16 w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none transition-[color,box-shadow] placeholder:text-slate-500 focus-visible:border-emerald-300",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
