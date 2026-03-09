import { forwardRef, type InputHTMLAttributes } from "react";

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: string;
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, helpText, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[20px] text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full bg-[#f5f5f5] text-gray-800 text-sm",
              "rounded-xl px-4 py-2.5",
              "shadow-neu-in-sm",
              "border border-transparent",
              "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500",
              "placeholder:text-gray-400",
              "transition-all duration-150",
              error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "",
              icon ? "pl-10" : "",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            ].join(" ")}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${inputId}-help`} className="text-xs text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = "NeuInput";
export default NeuInput;
