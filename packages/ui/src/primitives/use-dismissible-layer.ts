import { useEffect, type RefObject } from "react";

interface DismissibleLayerOptions {
  dismissOnEscape?: boolean;
  dismissOnOutsidePointer?: boolean;
  enabled: boolean;
  insideRefs?: readonly RefObject<HTMLElement | null>[];
  onDismiss: () => void;
}

export function useDismissibleLayer(options: DismissibleLayerOptions) {
  const {
    dismissOnEscape = true,
    dismissOnOutsidePointer = false,
    enabled,
    insideRefs,
    onDismiss,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        dismissOnEscape &&
        !event.defaultPrevented &&
        event.key === "Escape"
      ) {
        onDismiss();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!dismissOnOutsidePointer) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (insideRefs?.some((ref) => ref.current?.contains(target))) {
        return;
      }
      onDismiss();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    dismissOnEscape,
    dismissOnOutsidePointer,
    enabled,
    insideRefs,
    onDismiss,
  ]);
}
