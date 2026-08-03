import type { HTMLAttributes } from "react";
import { classes } from "./classes.js";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4;
  interactive?: boolean;
  selected?: boolean;
}

export function Card({
  className,
  compact,
  elevation = 0,
  interactive,
  selected,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={classes(
        "kui-card",
        "bp6-card",
        compact && "kui-card--compact",
        interactive && "bp6-interactive",
        selected && "bp6-selected",
        elevation > 0 && `bp6-elevation-${elevation}`,
        className,
      )}
    />
  );
}
