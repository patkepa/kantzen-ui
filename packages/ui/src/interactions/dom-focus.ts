export function findEventItem<ElementType extends HTMLElement>(
  target: EventTarget | null,
  selector: string,
) {
  return target instanceof HTMLElement
    ? target.closest<ElementType>(selector)
    : null;
}

export function getScopedItems<ElementType extends HTMLElement>(
  scope: ParentNode,
  selector: string,
) {
  return Array.from(scope.querySelectorAll<ElementType>(selector));
}

export function focusKeyboardItem(item: HTMLElement | null | undefined) {
  if (!item) return;
  item.focus({ preventScroll: true });
  item.scrollIntoView({ block: "nearest", inline: "nearest" });
}
