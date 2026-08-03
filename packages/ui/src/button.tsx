import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "./icons.js";
import { classes, intentClass, type Intent } from "./classes.js";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  active?: boolean;
  children?: ReactNode;
  fill?: boolean;
  icon?: IconName | ReactNode;
  intent?: Intent;
  large?: boolean;
  loading?: boolean;
  minimal?: boolean;
  outlined?: boolean;
  rightIcon?: IconName | ReactNode;
  small?: boolean;
  text?: ReactNode;
}

function ButtonIcon({ icon }: { icon?: IconName | ReactNode }) {
  if (!icon) return null;
  return typeof icon === "string" ? <Icon icon={icon as IconName} /> : icon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      active,
      children,
      className,
      disabled,
      fill,
      icon,
      intent,
      large,
      loading,
      minimal,
      outlined,
      rightIcon,
      small,
      text,
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    return (
      <button
        {...buttonProps}
        className={classes(
          "kui-button",
          "bp6-button",
          active && "bp6-active",
          fill && "bp6-fill",
          large && "bp6-large",
          loading && "bp6-loading",
          minimal && "bp6-minimal",
          outlined && "bp6-outlined",
          small && "bp6-small",
          intentClass(intent),
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        type={type}
      >
        {loading ? (
          <span className="bp6-spinner bp6-spinner-small" aria-hidden="true" />
        ) : (
          <ButtonIcon icon={icon} />
        )}
        {text !== undefined || children !== undefined ? (
          <span className="bp6-button-text">{text ?? children}</span>
        ) : null}
        <ButtonIcon icon={rightIcon} />
      </button>
    );
  },
);
