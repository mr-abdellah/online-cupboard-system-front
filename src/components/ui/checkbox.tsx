"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, indeterminate, ...props }, ref) => {
  const checkboxRef =
    React.useRef<React.ElementRef<typeof CheckboxPrimitive.Root>>(null);
  const mergedRef = React.useMemo(() => {
    return (node: React.ElementRef<typeof CheckboxPrimitive.Root>) => {
      // @ts-ignore - Le type de ref.current est incomplet
      checkboxRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
  }, [ref]);

  React.useEffect(() => {
    if (checkboxRef.current) {
      // @ts-ignore - data-state n'est pas dans les types mais fonctionne
      checkboxRef.current.dataset.state = indeterminate
        ? "indeterminate"
        : checkboxRef.current.dataset.state;
      // @ts-ignore - aria-checked n'est pas dans les types mais fonctionne
      checkboxRef.current.ariaChecked = indeterminate
        ? "mixed"
        : checkboxRef.current.ariaChecked;
    }
  }, [indeterminate]);

  return (
    <CheckboxPrimitive.Root
      ref={mergedRef}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {indeterminate ? (
          <Minus className="h-2.5 w-2.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
