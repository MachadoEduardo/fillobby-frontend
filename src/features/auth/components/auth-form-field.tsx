import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

type AuthFormFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: string;
  helpText?: string;
  errors?: string[];
};

export function AuthFormField({
  id,
  label,
  helpText,
  errors,
  className,
  type,
  ...inputProps
}: AuthFormFieldProps) {
  const errorMessages = errors ?? [];
  const helpId = helpText ? `${id}-help` : undefined;
  const errorsId = errorMessages.length ? `${id}-errors` : undefined;
  const describedBy = [inputProps["aria-describedby"], helpId, errorsId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[#F5F1E8]">
        {label}
      </Label>
      {type === "password" ? (
        <PasswordInput
          {...inputProps}
          id={id}
          aria-invalid={errorsId ? true : inputProps["aria-invalid"]}
          aria-describedby={describedBy || undefined}
          className={cn(
            "border-[#30434A] bg-transparent text-[#F5F1E8] placeholder:text-[#AAB7B5] focus-visible:border-[#23B5D3] focus-visible:ring-[#23B5D3]/20",
            className,
          )}
          toggleClassName="text-brand-foreground/65 hover:text-brand-foreground"
        />
      ) : (
        <Input
          {...inputProps}
          id={id}
          type={type}
          aria-invalid={errorsId ? true : inputProps["aria-invalid"]}
          aria-describedby={describedBy || undefined}
          className={cn(
            "border-[#30434A] bg-transparent text-[#F5F1E8] placeholder:text-[#AAB7B5] focus-visible:border-[#23B5D3] focus-visible:ring-[#23B5D3]/20",
            className,
          )}
        />
      )}
      {helpText && (
        <p id={helpId} className="text-xs leading-relaxed text-[#AAB7B5]">
          {helpText}
        </p>
      )}
      {errorsId && (
        <ul
          id={errorsId}
          role="alert"
          className="space-y-1 text-xs text-[#EF8A82]"
        >
          {errorMessages.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
