import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  toggleClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, id, toggleClassName, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const toggleLabel = isPasswordVisible ? "Ocultar senha" : "Mostrar senha";
    const VisibilityIcon = isPasswordVisible ? EyeOff : Eye;

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          id={id}
          type={isPasswordVisible ? "text" : "password"}
          disabled={disabled}
          className={cn("pr-10", className)}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={isPasswordVisible}
          aria-controls={id}
          title={toggleLabel}
          disabled={disabled}
          onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
          className={cn(
            "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
            toggleClassName,
          )}
        >
          <VisibilityIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
