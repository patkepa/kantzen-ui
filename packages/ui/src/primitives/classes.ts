export function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type Intent = "none" | "primary" | "success" | "warning" | "danger";

export const Intent = {
  NONE: "none",
  PRIMARY: "primary",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
} as const;

export const intentClass = (intent?: Intent) =>
  intent && intent !== "none" ? `bp6-intent-${intent}` : undefined;
