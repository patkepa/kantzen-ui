import { Button } from "../primitives/button.js";
import { InputGroup } from "../primitives/input-group.js";

export interface SearchFieldProps {
  ariaLabel?: string;
  clearButtonAriaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}

export const SearchField = ({
  ariaLabel,
  clearButtonAriaLabel = "Clear search",
  value,
  onChange,
  placeholder = "Search...",
  inputRef,
  className,
}: SearchFieldProps) => {
  const inputAriaLabel =
    ariaLabel ?? (placeholder.replace(/\.{3}$/, "").trim() || "Search");

  return (
    <InputGroup
      aria-label={inputAriaLabel}
      className={className}
      inputRef={inputRef}
      leftIcon="search"
      placeholder={placeholder}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fill
      rightElement={
        value ? (
          <Button
            aria-label={clearButtonAriaLabel}
            icon="cross"
            minimal
            onClick={() => onChange("")}
            title={clearButtonAriaLabel}
          />
        ) : undefined
      }
    />
  );
};
