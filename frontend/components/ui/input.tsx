import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full rounded-md border border-slate-700 bg-transparent px-3 py-1 text-sm text-slate-100 outline-none transition-[color,box-shadow] placeholder:text-slate-500 focus-visible:border-emerald-300",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
