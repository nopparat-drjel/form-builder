import { type ChangeEvent } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, id }: ToggleProps) {
  const toggleId = id ?? `toggle-${Math.random().toString(36).slice(2)}`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.checked);
  }

  return (
    <label
      htmlFor={toggleId}
      className={[
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <span className="relative inline-block">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
        />
        {/* Track */}
        <span
          className={[
            "block w-11 h-6 rounded-full transition-colors duration-200",
            "shadow-neu-in-sm",
            checked ? "bg-green-600" : "bg-[#f5f5f5]",
          ].join(" ")}
          aria-hidden="true"
        />
        {/* Thumb */}
        <span
          className={[
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full",
            "bg-white shadow-neu-sm",
            "transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
          aria-hidden="true"
        />
      </span>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
}

export default Toggle;
