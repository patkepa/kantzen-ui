import { useState } from "react";
import {
  Button,
  Card,
  CtaBar,
  FeatureGrid,
  MetricStrip,
  SiteGrid,
  SiteHero,
  SiteSection,
} from "@kantzen-ui/ui";
import { SiteFooter, SiteNavbar, SiteShell } from "@kantzen-ui/ui/app-shell";
import type {
  ComponentDemoProps,
  ComponentDemoRegistry,
} from "./component-preview-types";

function SiteHeroDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <SiteHero
      className="wiki-site-component"
      actions={
        <Button
          intent="primary"
          text="Explore components"
          onClick={() => onFeedback("Component explorer opened")}
        />
      }
      description="A focused React system for expressive sites and dense workspaces."
      title="Build interfaces with a point of view."
    />
  );
}

function SiteSectionDemo() {
  return (
    <SiteSection
      className="wiki-site-component"
      description="Consistent spacing, hierarchy, and action placement."
      title="A section with structure"
    >
      <p>Section content stays deliberately open and composable.</p>
    </SiteSection>
  );
}

function SiteGridDemo() {
  return (
    <SiteGrid className="wiki-demo-site-grid" minColumnWidth="140px">
      {["Tokens", "Components", "Patterns"].map((label) => (
        <Card key={label}>{label}</Card>
      ))}
    </SiteGrid>
  );
}

function FeatureGridDemo() {
  return (
    <FeatureGrid
      className="wiki-site-component"
      features={[
        {
          icon: "cube",
          meta: "01",
          title: "Composable",
          description: "Small parts with clear ownership.",
        },
        {
          icon: "flash",
          meta: "02",
          title: "Responsive",
          description: "Layouts that adapt deliberately.",
        },
      ]}
    />
  );
}

function MetricStripDemo() {
  return (
    <MetricStrip
      className="wiki-site-component"
      metrics={[
        {
          label: "Components",
          value: "38",
          description: "Public surfaces",
        },
        {
          label: "Packages",
          value: "01",
          description: "One coherent system",
        },
        { label: "Theme", value: "Dark", description: "High contrast" },
      ]}
    />
  );
}

function CtaBarDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <CtaBar
      className="wiki-site-component"
      actions={
        <Button
          rightIcon="arrow-right"
          text="Get started"
          onClick={() => onFeedback("Getting-started flow opened")}
        />
      }
      description="Use the same system from landing page to workspace."
      title="Build the complete product."
    />
  );
}

function SiteNavbarDemo({ onFeedback }: ComponentDemoProps) {
  const [sitePath, setSitePath] = useState("/components");
  return (
    <SiteNavbar
      className="wiki-site-component"
      currentPath={sitePath}
      productName="Kantzen"
      navItems={[
        { href: "/product", label: "Product" },
        { href: "/components", label: "Components" },
        { href: "/docs", label: "Docs" },
      ]}
      actions={[
        { href: "/components", label: "Get started", intent: "primary" },
      ]}
      onNavigate={(href) => {
        setSitePath(href);
        onFeedback(`Navigated to ${href}`);
      }}
    />
  );
}

function SiteFooterDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <SiteFooter
      className="wiki-site-component"
      productName="Kantzen"
      onNavigate={(href) => onFeedback(`Footer link selected: ${href}`)}
      groups={[
        {
          label: "Product",
          items: [
            { href: "#components", label: "Components" },
            { href: "#patterns", label: "Patterns" },
          ],
        },
        {
          label: "Resources",
          items: [
            { href: "#docs", label: "Documentation" },
            { href: "#github", label: "GitHub" },
          ],
        },
      ]}
    />
  );
}

function SiteShellDemo({ onFeedback }: ComponentDemoProps) {
  const [sitePath, setSitePath] = useState("/components");
  return (
    <div className="wiki-shell-preview">
      <SiteShell
        className="wiki-site-component"
        productName="Kantzen"
        navItems={[{ href: "/components", label: "Components" }]}
        actions={[{ href: "/start", label: "Get started", intent: "primary" }]}
        currentPath={sitePath}
        onNavigate={(href) => {
          setSitePath(href);
          onFeedback(`Shell navigated to ${href}`);
        }}
      >
        <div className="wiki-shell-page">
          PUBLIC PAGE CONTENT / {sitePath.toUpperCase()}
        </div>
      </SiteShell>
    </div>
  );
}

export const siteComponentDemos = {
  CtaBar: CtaBarDemo,
  FeatureGrid: FeatureGridDemo,
  MetricStrip: MetricStripDemo,
  SiteFooter: SiteFooterDemo,
  SiteGrid: SiteGridDemo,
  SiteHero: SiteHeroDemo,
  SiteNavbar: SiteNavbarDemo,
  SiteSection: SiteSectionDemo,
  SiteShell: SiteShellDemo,
} satisfies ComponentDemoRegistry;
