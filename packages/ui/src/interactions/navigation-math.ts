export type LinearNavigationOrientation = "horizontal" | "vertical";

export interface GridNavigationPosition {
  columnIndex: number;
  rowIndex: number;
}

export function getLinearNavigationIndex(
  key: string,
  currentIndex: number,
  itemCount: number,
  orientation: LinearNavigationOrientation = "vertical",
) {
  if (itemCount <= 0 || currentIndex < 0 || currentIndex >= itemCount) {
    return null;
  }

  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;

  const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

  if (key === previousKey) return Math.max(0, currentIndex - 1);
  if (key === nextKey) return Math.min(itemCount - 1, currentIndex + 1);
  return null;
}

export function getGridNavigationPosition(
  key: string,
  current: GridNavigationPosition,
  columnSizes: readonly number[],
): GridNavigationPosition | null {
  const currentColumnSize = columnSizes[current.columnIndex] ?? 0;
  if (
    currentColumnSize <= 0 ||
    current.rowIndex < 0 ||
    current.rowIndex >= currentColumnSize
  ) {
    return null;
  }

  const rowIndex = getLinearNavigationIndex(
    key,
    current.rowIndex,
    currentColumnSize,
  );
  if (rowIndex !== null) {
    return { columnIndex: current.columnIndex, rowIndex };
  }

  const columnStep = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
  if (columnStep === 0) return null;

  for (
    let columnIndex = current.columnIndex + columnStep;
    columnIndex >= 0 && columnIndex < columnSizes.length;
    columnIndex += columnStep
  ) {
    const columnSize = columnSizes[columnIndex] ?? 0;
    if (columnSize === 0) continue;
    return {
      columnIndex,
      rowIndex: Math.min(current.rowIndex, columnSize - 1),
    };
  }

  return current;
}

export function getItemGridNavigationIndex(
  key: string,
  currentIndex: number,
  itemCount: number,
  columnCount: number,
) {
  if (
    itemCount <= 0 ||
    currentIndex < 0 ||
    currentIndex >= itemCount ||
    columnCount <= 0
  ) {
    return null;
  }

  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;

  const rowIndex = Math.floor(currentIndex / columnCount);
  const columnIndex = currentIndex % columnCount;
  const rowStart = rowIndex * columnCount;
  const rowEnd = Math.min(rowStart + columnCount, itemCount) - 1;

  if (key === "ArrowLeft") return Math.max(rowStart, currentIndex - 1);
  if (key === "ArrowRight") return Math.min(rowEnd, currentIndex + 1);
  if (key === "ArrowUp") {
    return rowIndex === 0 ? currentIndex : currentIndex - columnCount;
  }
  if (key === "ArrowDown") {
    const nextRowStart = (rowIndex + 1) * columnCount;
    if (nextRowStart >= itemCount) return currentIndex;
    return Math.min(nextRowStart + columnIndex, itemCount - 1);
  }

  return null;
}
