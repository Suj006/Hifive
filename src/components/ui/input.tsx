import { cn } from "@/lib/cn";
import { Children, cloneElement, forwardRef, isValidElement, useId } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  LabelHTMLAttributes,
  ReactElement,
} from "react";

const fieldClasses =
  "w-full h-10 rounded-xl bg-surface-2 border border-border px-3.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition-colors focus:border-brand-purple-2 focus:ring-2 focus:ring-brand-purple-2/20 disabled:opacity-50";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClasses, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldClasses, "h-auto min-h-20 py-2.5 resize-none", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldClasses, "appearance-none pr-8 bg-[right_0.75rem_center] bg-no-repeat", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a97b3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-semibold uppercase tracking-wide text-muted mb-1.5 inline-block",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  const child = Children.only(children);
  const withId = isValidElement(child)
    ? cloneElement(child as ReactElement<{ id?: string }>, { id })
    : child;

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {withId}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
