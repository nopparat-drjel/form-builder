import type { ElementType, HTMLAttributes, ReactNode } from "react";

type Elevation = "flat" | "raised" | "sunken";

type HtmlTag = "div" | "section" | "article" | "aside" | "main" | "header" | "footer" | "nav" | "ul" | "li";

interface NeuCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  elevation?: Elevation;
  padding?: "none" | "sm" | "md" | "lg";
  as?: HtmlTag;
}

const elevationClasses: Record<Elevation, string> = {
  flat: "shadow-neu-xs",
  raised: "shadow-neu",
  sunken: "shadow-neu-in",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function NeuCard({
  children,
  elevation = "raised",
  padding = "md",
  as: Tag = "div",
  className = "",
  ...props
}: NeuCardProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      className={[
        "bg-[#f5f5f5] rounded-2xl",
        elevationClasses[elevation],
        paddingClasses[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

export default NeuCard;
