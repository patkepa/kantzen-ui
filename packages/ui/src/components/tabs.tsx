import type { KeyboardEvent, ReactNode } from "react";

export interface TabItem<TId extends string = string> {
  disabled?: boolean;
  id: TId;
  label: ReactNode;
}

export interface TabsProps<TId extends string = string> {
  ariaLabel: string;
  className?: string;
  items: readonly TabItem<TId>[];
  onChange: (id: TId) => void;
  value: TId;
  variant?: "default" | "topbar";
}

export function Tabs<TId extends string>({
  ariaLabel,
  className,
  items,
  onChange,
  value,
  variant = "default",
}: TabsProps<TId>) {
  const selectFromKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const enabledItems = items
      .map((item, index) => ({ index, item }))
      .filter(({ item }) => !item.disabled);
    const enabledIndex = enabledItems.findIndex(
      ({ index }) => index === currentIndex,
    );
    if (enabledIndex < 0 || enabledItems.length === 0) return;

    const nextEnabledIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledItems.length - 1
          : (enabledIndex +
              (event.key === "ArrowRight" ? 1 : -1) +
              enabledItems.length) %
            enabledItems.length;
    const next = enabledItems[nextEnabledIndex];
    if (!next) return;

    onChange(next.item.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(next.index)
      ?.focus();
  };

  return (
    <div
      aria-label={ariaLabel}
      className={["kui-tabs", `kui-tabs--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            aria-selected={selected}
            className="kui-tabs__tab"
            disabled={item.disabled}
            key={item.id}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => selectFromKeyboard(event, index)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
