import type { IconName } from "@blueprintjs/icons";
import { Icon } from "../icons/icon.js";
import type { ReactNode } from "react";

export interface SegmentedControlItem<TValue extends string = string> {
  ariaLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  label: ReactNode;
  title?: string;
  value: TValue;
}

export interface SegmentedControlProps<TValue extends string = string> {
  ariaLabel: string;
  className?: string;
  items: readonly SegmentedControlItem<TValue>[];
  onChange: (value: TValue) => void;
  value: TValue;
  variant?: "compact" | "joined";
}

export function SegmentedControl<TValue extends string>({
  ariaLabel,
  className,
  items,
  onChange,
  value,
  variant = "compact",
}: SegmentedControlProps<TValue>) {
  return (
    <div
      aria-label={ariaLabel}
      className={[
        "kui-segmented-control",
        `kui-segmented-control--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            aria-label={item.ariaLabel}
            aria-pressed={selected}
            className={[
              "kui-segmented-control__option",
              selected && "is-active",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={item.disabled}
            key={item.value}
            onClick={() => onChange(item.value)}
            title={item.title}
            type="button"
          >
            {item.icon ? (
              <Icon aria-hidden="true" icon={item.icon} size={14} />
            ) : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
