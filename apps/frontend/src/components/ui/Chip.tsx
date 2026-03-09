import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
  icon?: string;
  onRemove?: () => void;
}

export function Chip({
  active = false,
  children,
  icon,
  onRemove,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        "transition-all duration-150 select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
        active
          ? "bg-green-700 text-white shadow-[2px_2px_4px_#1a4d24,_-2px_-2px_4px_#48b356]"
          : "bg-[#f5f5f5] text-gray-600 shadow-neu-xs hover:shadow-neu-sm",
        className,
      ].join(" ")}
      {...props}
    >
      {icon && (
        <span className="material-symbols-rounded text-[14px]">{icon}</span>
      )}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-red-400 focus:outline-none"
          aria-label="Remove"
        >
          <span className="material-symbols-rounded text-[14px]">close</span>
        </button>
      )}
    </button>
  );
}

export default Chip;
