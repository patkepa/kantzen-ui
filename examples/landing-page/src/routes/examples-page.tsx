import { useState } from "react";
import { Button, Icon } from "@kantzen-ui/ui";
import {
  LandingFooter,
  LandingHeader,
  type LandingPageProps,
} from "./landing-page";
import "./examples-page.css";

const examples = [
  {
    id: "workspace",
    number: "01",
    label: "Product workspace",
    title: "Operations workspace",
    description:
      "A dense application shell with navigation, search, status, cards, and an operational data table.",
    href: "/workspace",
    icon: "application" as const,
  },
  {
    id: "product",
    number: "02",
    label: "Public surface",
    title: "Product page",
    description:
      "A customer-facing product story assembled from the site shell, hero, metrics, feature grid, and calls to action.",
    href: "/site/product",
    icon: "globe" as const,
  },
  {
    id: "editorial",
    number: "03",
    label: "Content surface",
    title: "Editorial page",
    description:
      "A quieter publishing layout for checking long-form hierarchy, card rhythm, and responsive content density.",
    href: "/site/blog",
    icon: "paragraph" as const,
  },
  {
    id: "stress",
    number: "04",
    label: "System test",
    title: "Responsive stress lab",
    description:
      "Long labels and dense content deliberately push the system to reveal wrapping and layout edge cases.",
    href: "/stress",
    icon: "pulse" as const,
  },
] as const;

type ExampleId = (typeof examples)[number]["id"];

function ExamplePreview({ exampleId }: { exampleId: ExampleId }) {
  return (
    <div
      className={`examples-preview examples-preview--${exampleId}`}
      aria-hidden="true"
    >
      <div className="examples-preview-bar">
        <span />
        <span />
        <span />
      </div>
      <div className="examples-preview-body">
        <div className="examples-preview-rail">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="examples-preview-canvas">
          <div className="examples-preview-heading" />
          <div className="examples-preview-copy" />
          <div className="examples-preview-copy is-short" />
          <div className="examples-preview-content">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamplesPage({ onNavigate }: LandingPageProps) {
  const [selectedId, setSelectedId] = useState<ExampleId>(examples[0].id);
  const selected =
    examples.find((example) => example.id === selectedId) ?? examples[0];

  return (
    <div className="landing-page examples-page">
      <LandingHeader activeItem="examples" onNavigate={onNavigate} />
      <main className="examples-main" id="top">
        <header className="examples-intro">
          <span className="landing-section-label">WORKING EXAMPLES</span>
          <h1>
            Choose a surface.
            <br />
            Enter the system.
          </h1>
          <p>
            Browse complete, working examples without dropping directly into
            one. Select a surface to inspect it, then open the full experience.
          </p>
        </header>

        <section className="examples-panel" aria-label="Example browser">
          <div className="examples-panel-header">
            <span>EXAMPLE INDEX</span>
            <span>{String(examples.length).padStart(2, "0")} SURFACES</span>
          </div>

          <div className="examples-panel-layout">
            <nav className="examples-index" aria-label="Available examples">
              {examples.map((example) => {
                const selectedItem = example.id === selected.id;

                return (
                  <button
                    aria-pressed={selectedItem}
                    className={selectedItem ? "is-selected" : undefined}
                    key={example.id}
                    type="button"
                    onClick={() => setSelectedId(example.id)}
                  >
                    <span className="examples-index-number">
                      {example.number}
                    </span>
                    <span className="examples-index-copy">
                      <strong>{example.title}</strong>
                      <small>{example.label}</small>
                    </span>
                    <Icon icon={example.icon} size={15} />
                  </button>
                );
              })}
            </nav>

            <article className="examples-detail" aria-live="polite">
              <ExamplePreview exampleId={selected.id} />
              <div className="examples-detail-copy">
                <div className="examples-detail-meta">
                  <span>{selected.number}</span>
                  <span>{selected.label}</span>
                </div>
                <h2>{selected.title}</h2>
                <p>{selected.description}</p>
                <Button
                  intent="primary"
                  rightIcon="arrow-right"
                  text="Enter example"
                  onClick={() => onNavigate(selected.href)}
                />
              </div>
            </article>
          </div>
        </section>
      </main>
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
}
