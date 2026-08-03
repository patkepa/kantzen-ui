import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button, Icon, InputGroup } from "@kantzen-ui/ui";
import {
  catalogGroups,
  catalogItems,
  getCatalogItem,
} from "./component-catalog";
import { ComponentPreview } from "./component-preview";
import { getComponentExample } from "./component-examples";
import { LandingHeader } from "./landing-page";
import "./component-gallery.css";

interface SiteRouteProps {
  currentPath: string;
  onNavigate: (href: string) => void;
}

interface ApiRow {
  prop: string;
  type: string;
  defaultValue: string;
}

const apiByExport: Record<string, readonly ApiRow[]> = {
  Button: [
    {
      prop: "intent",
      type: '"primary" | "success" | "warning" | "danger"',
      defaultValue: "—",
    },
    { prop: "text", type: "ReactNode", defaultValue: "—" },
    { prop: "icon", type: "IconName | ReactNode", defaultValue: "—" },
    { prop: "rightIcon", type: "IconName | ReactNode", defaultValue: "—" },
    { prop: "minimal", type: "boolean", defaultValue: "false" },
    { prop: "outlined", type: "boolean", defaultValue: "false" },
    { prop: "loading", type: "boolean", defaultValue: "false" },
    { prop: "disabled", type: "boolean", defaultValue: "false" },
  ],
  ForceGraphCanvas: [
    {
      prop: "nodes",
      type: "readonly ForceGraphNode[]",
      defaultValue: "required",
    },
    {
      prop: "edges",
      type: "readonly ForceGraphEdge[]",
      defaultValue: "required",
    },
    { prop: "display", type: "ForceGraphDisplay", defaultValue: "{}" },
    { prop: "running", type: "boolean", defaultValue: "true" },
    {
      prop: "onSelectNode",
      type: "(id: string | null) => void",
      defaultValue: "—",
    },
  ],
  InputGroup: [
    { prop: "fill", type: "boolean", defaultValue: "false" },
    { prop: "leftIcon", type: "IconName", defaultValue: "—" },
    { prop: "rightElement", type: "ReactNode", defaultValue: "—" },
    { prop: "intent", type: "Intent", defaultValue: "—" },
    { prop: "inputRef", type: "Ref<HTMLInputElement>", defaultValue: "—" },
  ],
  Tabs: [
    { prop: "items", type: "readonly TabItem[]", defaultValue: "required" },
    { prop: "value", type: "string", defaultValue: "required" },
    {
      prop: "onChange",
      type: "(id: string) => void",
      defaultValue: "required",
    },
    {
      prop: "variant",
      type: '"default" | "topbar"',
      defaultValue: '"default"',
    },
    { prop: "ariaLabel", type: "string", defaultValue: "required" },
  ],
};

const defaultApi: readonly ApiRow[] = [
  { prop: "className", type: "string", defaultValue: "—" },
  { prop: "children", type: "ReactNode", defaultValue: "—" },
  { prop: "ariaLabel", type: "string", defaultValue: "—" },
];

const getComponentIdFromHash = () => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  return catalogItems.some((item) => item.id === hash) ? hash : null;
};

const getInitialComponentId = () => getComponentIdFromHash() ?? "button";

export const ComponentGallery = ({ onNavigate }: SiteRouteProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "usage">("preview");
  const [copied, setCopied] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(getInitialComponentId);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const selected = getCatalogItem(selectedId);

  useEffect(() => {
    document.title = `${selected.name} — Kantzen UI components`;
  }, [selected.name]);

  useEffect(() => {
    const onHashChange = () => {
      const componentId = getComponentIdFromHash();
      if (componentId) setSelectedId(componentId);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileCatalogOpen(true);
        window.requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      if (event.key === "Escape" && mobileCatalogOpen) {
        setMobileCatalogOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileCatalogOpen]);

  const filteredGroups = useMemo(
    () =>
      catalogGroups
        .map((group) => ({
          ...group,
          items: deferredQuery
            ? group.items.filter((item) =>
                `${item.name} ${item.exportName} ${item.description}`
                  .toLowerCase()
                  .includes(deferredQuery),
              )
            : group.items,
        }))
        .filter((group) => group.items.length > 0),
    [deferredQuery],
  );

  const code = getComponentExample(selected);
  const apiRows = apiByExport[selected.exportName] ?? defaultApi;

  const selectComponent = (id: string) => {
    setSelectedId(id);
    setActiveTab("preview");
    setMobileCatalogOpen(false);
    window.history.replaceState(null, "", `${window.location.pathname}#${id}`);
    document
      .querySelector(".component-wiki-main")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="component-wiki">
      <LandingHeader activeItem="components" onNavigate={onNavigate} />

      {mobileCatalogOpen ? (
        <button
          aria-label="Close component catalog"
          className="component-wiki-backdrop"
          type="button"
          onClick={() => setMobileCatalogOpen(false)}
        />
      ) : null}

      <aside
        className={["component-wiki-sidebar", mobileCatalogOpen && "is-open"]
          .filter(Boolean)
          .join(" ")}
        aria-label="Component catalog"
      >
        <div className="component-wiki-sidebar-search">
          <InputGroup
            aria-label="Search components"
            fill
            inputRef={searchInputRef}
            leftIcon="search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search components…"
            rightElement={
              query ? (
                <Button
                  aria-label="Clear search"
                  icon="cross"
                  minimal
                  onClick={() => setQuery("")}
                />
              ) : (
                <kbd>⌘ K</kbd>
              )
            }
            type="search"
            value={query}
          />
        </div>
        <nav>
          <section>
            <h2>GETTING STARTED</h2>
            <button type="button" onClick={() => selectComponent("button")}>
              <Icon icon="home" size={13} />
              Overview
            </button>
            <a
              href="https://github.com/patkepa/kantzen-ui#readme"
              target="_blank"
              rel="noreferrer"
            >
              <Icon icon="download" size={13} />
              Installation
            </a>
            <a
              href="https://github.com/patkepa/kantzen-ui/tree/main/packages/ui#theming"
              target="_blank"
              rel="noreferrer"
            >
              <Icon icon="style" size={13} />
              Theming
            </a>
          </section>
          {filteredGroups.map((group) => (
            <section key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map((item) => (
                <button
                  aria-current={item.id === selected.id ? "page" : undefined}
                  className={item.id === selected.id ? "is-active" : undefined}
                  key={item.id}
                  type="button"
                  onClick={() => selectComponent(item.id)}
                >
                  <Icon icon={item.icon} size={13} />
                  <span>{item.name}</span>
                </button>
              ))}
            </section>
          ))}
          {filteredGroups.length === 0 ? (
            <p className="component-wiki-empty">
              No components match “{query}”.
            </p>
          ) : null}
        </nav>
      </aside>

      <main className="component-wiki-main">
        <article>
          <div className="component-wiki-breadcrumb">
            <button type="button" onClick={() => setMobileCatalogOpen(true)}>
              Components
            </button>
            <span>/</span>
            <span>{selected.name}</span>
          </div>
          <header className="component-wiki-article-header" id="overview">
            <div>
              <h1>{selected.name}</h1>
              <p>{selected.description}</p>
            </div>
            <a
              href={`https://github.com/patkepa/kantzen-ui/blob/main/packages/ui/src`}
              target="_blank"
              rel="noreferrer"
            >
              View source <Icon icon="code" size={13} />
            </a>
          </header>

          <div
            className="component-wiki-tabs"
            role="tablist"
            aria-label="Component example"
          >
            <button
              aria-selected={activeTab === "preview"}
              role="tab"
              type="button"
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
            <button
              aria-selected={activeTab === "usage"}
              role="tab"
              type="button"
              onClick={() => setActiveTab("usage")}
            >
              Usage
            </button>
          </div>

          <section
            className="component-wiki-preview"
            id="variants"
            aria-label={`${selected.name} ${activeTab}`}
          >
            {activeTab === "preview" ? (
              <ComponentPreview key={selected.id} item={selected} />
            ) : (
              <pre>
                <code>{code}</code>
              </pre>
            )}
          </section>

          <section className="component-wiki-api" id="api">
            <h2>API Reference</h2>
            <div
              className="component-wiki-api-table"
              role="table"
              aria-label={`${selected.name} API reference`}
            >
              <div className="is-header" role="row">
                <span role="columnheader">Prop</span>
                <span role="columnheader">Type</span>
                <span role="columnheader">Default</span>
              </div>
              {apiRows.map((row) => (
                <div role="row" key={row.prop}>
                  <code role="cell">{row.prop}</code>
                  <code role="cell">{row.type}</code>
                  <code role="cell">{row.defaultValue}</code>
                  <Icon icon="chevron-right" size={12} />
                </div>
              ))}
            </div>
          </section>

          <section className="component-wiki-code" id="usage">
            <h2>Code</h2>
            <div className="component-wiki-code-frame">
              <header>
                <span>TSX</span>
                <button type="button" onClick={() => void copyCode()}>
                  <Icon icon={copied ? "confirm" : "clipboard"} size={13} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </header>
              <pre>
                <code>{code}</code>
              </pre>
            </div>
          </section>

          <footer className="component-wiki-next">
            <span>Next component</span>
            <button
              type="button"
              onClick={() => {
                const index = catalogItems.findIndex(
                  (item) => item.id === selected.id,
                );
                selectComponent(
                  catalogItems[(index + 1) % catalogItems.length]!.id,
                );
              }}
            >
              {
                catalogItems[
                  (catalogItems.findIndex((item) => item.id === selected.id) +
                    1) %
                    catalogItems.length
                ]!.name
              }
              <Icon icon="arrow-right" size={14} />
            </button>
          </footer>
        </article>
      </main>

      <aside className="component-wiki-outline" aria-label="On this page">
        <h2>ON THIS PAGE</h2>
        <a className="is-active" href="#overview">
          Overview
        </a>
        <a href="#variants">Variants</a>
        <a href="#api">API</a>
        <a href="#usage">Usage</a>
      </aside>

      <button
        className="component-wiki-mobile-catalog"
        type="button"
        onClick={() => setMobileCatalogOpen(true)}
      >
        <Icon icon="grid-view" size={18} />
        <span>Browse all {catalogItems.length} components</span>
        <Icon icon="chevron-up" size={15} />
      </button>
    </div>
  );
};
