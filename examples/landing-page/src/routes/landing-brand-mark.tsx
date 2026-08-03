export interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span
      className={["landing-brand-mark", compact && "is-compact"]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" role="presentation">
        <path d="M7 3v26M8 16 23 3M8 16l15 13M13 12l11-9M13 20l11 9" />
      </svg>
    </span>
  );
}
