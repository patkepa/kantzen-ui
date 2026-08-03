import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import type { IconName } from "@blueprintjs/icons";
import { Icon } from "../icons/icon.js";
import { classes, intentClass, type Intent } from "./classes.js";

export interface InputGroupProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  asyncControl?: boolean;
  fill?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  intent?: Intent;
  large?: boolean;
  leftElement?: ReactNode;
  leftIcon?: IconName;
  rightElement?: ReactNode;
  round?: boolean;
  small?: boolean;
}

export function InputGroup({
  className,
  fill,
  inputRef,
  intent,
  large,
  leftElement,
  leftIcon,
  rightElement,
  round,
  small,
  ...inputProps
}: InputGroupProps) {
  return (
    <div
      className={classes(
        "kui-input-group",
        "bp6-input-group",
        fill && "bp6-fill",
        large && "bp6-large",
        leftIcon && "bp6-input-group--with-left-icon",
        rightElement != null && "bp6-input-group--with-right-element",
        round && "bp6-round",
        small && "bp6-small",
        intentClass(intent),
        className,
      )}
    >
      {leftElement ?? (leftIcon ? <Icon icon={leftIcon} /> : null)}
      <input {...inputProps} className="kui-input bp6-input" ref={inputRef} />
      {rightElement ? (
        <span className="bp6-input-action">{rightElement}</span>
      ) : null}
    </div>
  );
}
