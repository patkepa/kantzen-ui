import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./icons.js";
import { Button } from "./button.js";
import { classes, intentClass, type Intent } from "./classes.js";

export interface AlertProps {
  canEscapeKeyCancel?: boolean;
  canOutsideClickCancel?: boolean;
  cancelButtonText?: string;
  children?: ReactNode;
  className?: string;
  confirmButtonText?: string;
  icon?: IconName;
  intent?: Intent;
  isOpen: boolean;
  loading?: boolean;
  style?: CSSProperties;
  onCancel?: () => void;
  onClose?: (confirmed: boolean) => void;
  onConfirm?: () => void;
}

export function Alert({
  canEscapeKeyCancel,
  canOutsideClickCancel,
  cancelButtonText,
  children,
  className,
  confirmButtonText = "OK",
  icon,
  intent,
  isOpen,
  loading,
  onCancel,
  onClose,
  onConfirm,
  style,
}: AlertProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancel = useCallback(() => {
    onCancel?.();
    onClose?.(false);
  }, [onCancel, onClose]);
  const confirm = useCallback(() => {
    onConfirm?.();
    onClose?.(true);
  }, [onClose, onConfirm]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() =>
      confirmRef.current?.focus(),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (canEscapeKeyCancel && event.key === "Escape") cancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [canEscapeKeyCancel, cancel, isOpen]);

  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(
    <div className="kui-overlay bp6-overlay bp6-overlay-open">
      <div
        className="bp6-overlay-backdrop"
        onMouseDown={(event) => {
          if (canOutsideClickCancel && event.target === event.currentTarget)
            cancel();
        }}
      />
      <div
        aria-modal="true"
        className={classes("kui-alert", "bp6-alert", "bp6-dialog", className)}
        role="alertdialog"
        style={style}
      >
        <div className="bp6-alert-body">
          {icon ? (
            <Icon className={intentClass(intent)} icon={icon} size={32} />
          ) : null}
          <div className="bp6-alert-contents">{children}</div>
        </div>
        <div className="bp6-alert-footer">
          {cancelButtonText ? (
            <Button
              disabled={loading}
              onClick={cancel}
              text={cancelButtonText}
            />
          ) : null}
          <Button
            intent={intent}
            loading={loading}
            onClick={confirm}
            ref={confirmRef}
            text={confirmButtonText}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
