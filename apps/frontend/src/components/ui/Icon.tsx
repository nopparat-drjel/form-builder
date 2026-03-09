import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols icon name, e.g. "home", "settings" */
  name: string;
  /** Font size in px (applies via font-size). Default 24 */
  size?: number;
  /** FILL variation: 0 (outline) | 1 (filled). Default 0 */
  fill?: 0 | 1;
}

/**
 * Material Symbols Rounded wrapper.
 *
 * Usage: <I name="home" size={20} fill={1} />
 */
export function I({ name, size = 24, fill = 0, className = "", style, ...props }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${fill}, "wght" 400, "GRAD" 0, "opsz" ${size}`,
        lineHeight: 1,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}

export default I;
