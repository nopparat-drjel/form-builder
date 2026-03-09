import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "primary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: string;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-[#f5f5f5] text-gray-700 shadow-neu-sm hover:shadow-neu active:shadow-neu-in-sm",
  primary:
    "bg-green-700 text-white shadow-[4px_4px_8px_#1a4d24,_-4px_-4px_8px_#48b356] hover:bg-green-800 active:shadow-[inset_2px_2px_4px_#1a4d24,_inset_-2px_-2px_4px_#48b356]",
  danger:
    "bg-red-500 text-white shadow-[4px_4px_8px_#b91c1c,_-4px_-4px_8px_#fca5a5] hover:bg-red-600 active:shadow-[inset_2px_2px_4px_#b91c1c]",
  ghost:
    "bg-transparent text-gray-600 hover:bg-white/50 active:bg-white/80",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-2xl gap-2",
};

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      loading = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center font-prompt font-medium",
          "transition-all duration-150 select-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <span className="material-symbols-rounded text-[18px] animate-spin">
            progress_activity
          </span>
        ) : icon ? (
          <span className="material-symbols-rounded text-[18px]">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

NeuButton.displayName = "NeuButton";
export default NeuButton;
