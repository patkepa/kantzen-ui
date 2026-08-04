import { useState } from "react";
import type { CatalogItem } from "./component-catalog";
import { componentPreviewRegistry } from "./component-preview-registry";
import { ShellDiagram } from "./component-preview-shared";

interface ComponentPreviewProps {
  item: CatalogItem;
}

export function ComponentPreview({ item }: ComponentPreviewProps) {
  const [feedback, setFeedback] = useState(`${item.name} ready`);
  const Preview = componentPreviewRegistry[item.exportName];

  return (
    <div className="wiki-preview-stage">
      <div className="wiki-preview-content">
        {Preview ? (
          <Preview onFeedback={setFeedback} />
        ) : (
          <ShellDiagram active={item.exportName.toUpperCase()} />
        )}
      </div>
      <output className="wiki-demo-feedback" aria-live="polite">
        <span>STATE</span>
        {feedback}
      </output>
    </div>
  );
}
