import {
  findEventItem,
  focusKeyboardItem,
  getScopedItems,
} from "../interactions/dom-focus.js";
import { getLinearNavigationIndex } from "../interactions/navigation-math.js";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

const optionSelector = '[data-kui-selectable-option="true"]';

export interface SelectableListProps<TItem extends { id: string }> {
  ariaLabel: string;
  className?: string;
  empty: ReactNode;
  items: readonly TItem[];
  onSelect: (item: TItem) => void;
  renderItem: (item: TItem) => ReactNode;
  rowClassName?: string;
  selectedId: string | null;
  wrapItem?: (item: TItem, row: ReactElement) => ReactNode;
}

export function SelectableList<TItem extends { id: string }>({
  ariaLabel,
  className,
  empty,
  items,
  onSelect,
  renderItem,
  rowClassName,
  selectedId,
  wrapItem,
}: SelectableListProps<TItem>) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = items.findIndex((item) => item.id === selectedId);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentRow = findEventItem<HTMLButtonElement>(
        event.target,
        optionSelector,
      );
      if (!currentRow) return;

      const rows = getScopedItems<HTMLButtonElement>(
        event.currentTarget,
        optionSelector,
      );
      const nextIndex = getLinearNavigationIndex(
        event.key,
        rows.indexOf(currentRow),
        rows.length,
      );
      if (nextIndex === null) return;

      event.preventDefault();
      focusKeyboardItem(rows[nextIndex]);
      const nextItem = items[nextIndex];
      if (nextItem) onSelect(nextItem);
    },
    [items, onSelect],
  );

  useEffect(() => {
    const list = listRef.current;
    const selectedRow = selectedRowRef.current;
    if (!list || !selectedRow) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = selectedRow.getBoundingClientRect();
    if (rowRect.top < listRect.top) {
      list.scrollTop -= listRect.top - rowRect.top;
    } else if (rowRect.bottom > listRect.bottom) {
      list.scrollTop += rowRect.bottom - listRect.bottom;
    }
  }, [selectedId]);

  if (items.length === 0) return <>{empty}</>;

  return (
    <div
      aria-label={ariaLabel}
      aria-orientation="vertical"
      className={["kui-selectable-list", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
      ref={listRef}
      role="listbox"
    >
      {items.map((item, index) => {
        const selected = selectedId === item.id;
        const row = (
          <button
            aria-posinset={index + 1}
            aria-selected={selected}
            aria-setsize={items.length}
            className={[
              "kui-selectable-list__option",
              rowClassName,
              selected && "is-selected",
            ]
              .filter(Boolean)
              .join(" ")}
            data-kui-selectable-option="true"
            onClick={() => onSelect(item)}
            ref={selected ? selectedRowRef : undefined}
            role="option"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            {renderItem(item)}
          </button>
        );
        return (
          <Fragment key={item.id}>
            {wrapItem ? wrapItem(item, row) : row}
          </Fragment>
        );
      })}
    </div>
  );
}
