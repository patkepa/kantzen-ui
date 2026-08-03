import { useState } from "react";
import { Button, Tag } from "@kantzen-ui/ui";
import { ForceGraphCanvas } from "@kantzen-ui/graph";
import { SiteFooter, SiteShell } from "@kantzen-ui/app-shell";
import {
  CtaBar,
  DemoFrame,
  FeatureGrid,
  ExpandableSearchField,
  MetricStrip,
  SiteGrid,
  SiteHero,
  SiteSection,
  SegmentedControl,
  SelectableList,
  Tabs,
} from "@kantzen-ui/ui";
import { productFeatures, productMetrics } from "../fixtures/site-content";
import { footerGroups, siteActions, siteNavItems } from "../fixtures/site-nav";
import { WorkspacePanelMock } from "../workspace-panel-mock";

interface SiteRouteProps {
  currentPath: string;
  onNavigate: (href: string) => void;
}

const galleryGraphNodes = [
  { id: "ui", label: "UI", color: "#60a5fa" },
  { id: "shell", label: "Shell", color: "#a78bfa" },
  { id: "graph", label: "Graph", color: "#22c55e" },
];
const galleryGraphEdges = [
  { id: "ui-shell", source: "ui", target: "shell" },
  { id: "ui-graph", source: "ui", target: "graph" },
];
const galleryListItems = [
  { id: "alpha", label: "Alpha workspace" },
  { id: "beta", label: "Beta workspace" },
  { id: "gamma", label: "Gamma workspace" },
];

export const ComponentGallery = ({
  currentPath,
  onNavigate,
}: SiteRouteProps) => {
  const [tab, setTab] = useState("overview");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState("alpha");

  return (
    <SiteShell
      productName="Kantzen"
      navItems={siteNavItems}
      actions={siteActions}
      currentPath={currentPath}
      onNavigate={onNavigate}
      footer={<SiteFooter productName="Kantzen" groups={footerGroups} />}
    >
      <SiteHero
        eyebrow="Component gallery"
        title="Reusable blocks for site pages"
        description="A focused route for validating public-page primitives without committing to one marketing page composition."
      />
      <SiteSection title="Grid primitives">
        <SiteGrid>
          <DemoFrame title="Demo frame" eyebrow="FRAME" footer="Footer slot">
            <WorkspacePanelMock compact />
          </DemoFrame>
          <CtaBar
            title="CTA bar"
            description="Useful for product, docs, and campaign pages."
            actions={<Button text="Action" />}
          />
        </SiteGrid>
      </SiteSection>
      <SiteSection title="Feature grid">
        <FeatureGrid features={productFeatures} />
      </SiteSection>
      <SiteSection title="Metrics" actions={<Tag minimal>Tabular values</Tag>}>
        <MetricStrip metrics={productMetrics} />
      </SiteSection>
      <SiteSection title="Workspace controls">
        <div className="component-control-gallery">
          <Tabs
            ariaLabel="Gallery sections"
            items={[
              { id: "overview", label: "Overview" },
              { id: "activity", label: "Activity" },
            ]}
            onChange={setTab}
            value={tab}
          />
          <SegmentedControl
            ariaLabel="Gallery view"
            items={[
              { icon: "list", label: "List", value: "list" },
              { icon: "grid-view", label: "Grid", value: "grid" },
            ]}
            onChange={setView}
            value={view}
          />
          <ExpandableSearchField
            onChange={setQuery}
            placeholder="Filter components"
            value={query}
          />
          <SelectableList
            ariaLabel="Example workspaces"
            className="component-gallery-list"
            empty={null}
            items={galleryListItems}
            onSelect={(item) => setSelectedItem(item.id)}
            renderItem={(item) => item.label}
            selectedId={selectedItem}
          />
        </div>
      </SiteSection>
      <SiteSection title="Force graph">
        <div className="component-gallery-graph">
          <ForceGraphCanvas
            nodes={galleryGraphNodes}
            edges={galleryGraphEdges}
          />
        </div>
      </SiteSection>
    </SiteShell>
  );
};
