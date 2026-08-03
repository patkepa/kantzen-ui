import { Icon } from "./primitives.js";
import { useRef, useState } from "react";
import { SearchField } from "./search-field.js";

export interface ExpandableSearchFieldProps {
  ariaLabel?: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  value: string;
}

export function ExpandableSearchField({
  ariaLabel,
  className,
  onChange,
  placeholder = "Search...",
  triggerClassName,
  value,
}: ExpandableSearchFieldProps) {
  const [open, setOpen] = useState(() => value.length > 0);
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const label =
    ariaLabel ??
    `Search ${placeholder.replace(/^Filter\s+/i, "").toLocaleLowerCase()}`;

  const openSearch = () => {
    setOpen(true);
    window.requestAnimationFrame(() => internalInputRef.current?.focus());
  };

  return open ? (
    <SearchField
      className={["kui-expandable-search-field", className]
        .filter(Boolean)
        .join(" ")}
      inputRef={internalInputRef}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  ) : (
    <button
      aria-label={label}
      className={["kui-expandable-search-trigger", triggerClassName]
        .filter(Boolean)
        .join(" ")}
      onClick={openSearch}
      title={placeholder}
      type="button"
    >
      <Icon aria-hidden="true" icon="search" />
    </button>
  );
}
