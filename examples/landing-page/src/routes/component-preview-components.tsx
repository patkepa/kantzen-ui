import { useState } from "react";
import {
  Button,
  DemoFrame,
  EmptyState,
  ExpandableSearchField,
  FilterPill,
  Icon,
  InspectorWorkspace,
  SearchField,
  SegmentedControl,
  SelectableList,
  StatusLed,
  Tabs,
  WorkspaceBottomToolbar,
  WorkspaceToolbar,
} from "@patkepa/kantzen-ui";
import {
  componentPreviewListItems,
  LabelledSample,
} from "./component-preview-shared";
import type {
  ComponentDemoProps,
  ComponentDemoRegistry,
} from "./component-preview-types";

function TabsDemo({ onFeedback }: ComponentDemoProps) {
  const [tab, setTab] = useState("overview");
  return (
    <div className="wiki-control-demo">
      <Tabs
        ariaLabel="Example tabs"
        items={[
          { id: "overview", label: "Overview" },
          { id: "activity", label: "Activity" },
          { id: "settings", label: "Settings" },
        ]}
        onChange={(value) => {
          setTab(value);
          onFeedback(`${value} tab selected`);
        }}
        value={tab}
      />
      <div className="wiki-control-panel" role="tabpanel">
        <span className="mono-data">{tab.toUpperCase()}</span>
        <strong>{tab[0]!.toUpperCase() + tab.slice(1)} panel</strong>
      </div>
    </div>
  );
}

function SegmentedControlDemo({ onFeedback }: ComponentDemoProps) {
  const [controlValue, setControlValue] = useState("preview");
  return (
    <div className="wiki-control-demo">
      <SegmentedControl
        ariaLabel="Preview mode"
        items={[
          { icon: "eye-open", label: "Preview", value: "preview" },
          { icon: "code", label: "Code", value: "code" },
          { icon: "document", label: "Docs", value: "docs" },
        ]}
        onChange={(value) => {
          setControlValue(value);
          onFeedback(`${value} mode selected`);
        }}
        value={controlValue}
        variant="joined"
      />
      <div className="wiki-mode-readout mono-data">
        MODE / {controlValue.toUpperCase()}
      </div>
    </div>
  );
}

function SearchFieldDemo({ onFeedback }: ComponentDemoProps) {
  const [query, setQuery] = useState("");
  return (
    <div className="wiki-preview-narrow">
      <SearchField
        onChange={(value) => {
          setQuery(value);
          onFeedback(
            value
              ? `Found ${Math.max(1, 8 - value.length)} matches`
              : "Search ready",
          );
        }}
        placeholder="Search components…"
        value={query}
      />
    </div>
  );
}

function ExpandableSearchFieldDemo({ onFeedback }: ComponentDemoProps) {
  const [query, setQuery] = useState("");
  return (
    <div className="wiki-preview-narrow">
      <ExpandableSearchField
        onChange={(value) => {
          setQuery(value);
          onFeedback(value ? `Filtering by “${value}”` : "Filter cleared");
        }}
        placeholder="Filter components"
        value={query}
      />
    </div>
  );
}

function FilterPillDemo({ onFeedback }: ComponentDemoProps) {
  const [filter, setFilter] = useState("all");
  return (
    <div className="wiki-preview-row">
      {[
        ["all", "All", 18],
        ["ready", "Ready", 12],
        ["review", "In review", 6],
      ].map(([value, label, count]) => (
        <FilterPill
          active={filter === value}
          count={Number(count)}
          key={value}
          label={String(label)}
          onSelect={(nextFilter) => {
            setFilter(nextFilter);
            onFeedback(`${String(label)} filter applied`);
          }}
          value={String(value)}
        />
      ))}
    </div>
  );
}

function SelectableListDemo({ onFeedback }: ComponentDemoProps) {
  const [selectedItem, setSelectedItem] = useState("design");
  return (
    <SelectableList
      ariaLabel="Example projects"
      className="component-gallery-list wiki-demo-list"
      empty={<span>No results</span>}
      items={componentPreviewListItems}
      onSelect={(entry) => {
        setSelectedItem(entry.id);
        onFeedback(`${entry.label} selected`);
      }}
      renderItem={(entry) => (
        <>
          <Icon icon="cube" size={13} />
          <span>{entry.label}</span>
          <Icon icon="chevron-right" size={12} />
        </>
      )}
      selectedId={selectedItem}
    />
  );
}

function StatusLedDemo() {
  return (
    <div className="wiki-preview-row">
      <LabelledSample label="Online">
        <span className="wiki-status">
          <StatusLed status="online" />
          Running
        </span>
      </LabelledSample>
      <LabelledSample label="Warning">
        <span className="wiki-status">
          <StatusLed status="warning" />
          Queued
        </span>
      </LabelledSample>
      <LabelledSample label="Offline">
        <span className="wiki-status">
          <StatusLed status="offline" />
          Failed
        </span>
      </LabelledSample>
    </div>
  );
}

function EmptyStateDemo() {
  return (
    <EmptyState
      description="Try adjusting your filters or create a new item."
      icon="search"
      title="No matching components"
    />
  );
}

function DemoFrameDemo({ onFeedback }: ComponentDemoProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded((current) => {
      onFeedback(current ? "Details collapsed" : "Details expanded");
      return !current;
    });
  };
  return (
    <DemoFrame
      actions={
        <Button
          aria-label="Toggle deployment details"
          active={expanded}
          minimal
          icon={expanded ? "chevron-up" : "more"}
          onClick={toggleExpanded}
        />
      }
      eyebrow="LIVE EXAMPLE"
      footer="Keyboard accessible"
      title="Deployment status"
    >
      <div className="wiki-demo-content">
        <StatusLed status="online" />
        <strong>All systems operational</strong>
        {expanded ? (
          <span className="mono-data">12 / 12 CHECKS PASSED</span>
        ) : null}
      </div>
    </DemoFrame>
  );
}

function WorkspaceToolbarDemo({ onFeedback }: ComponentDemoProps) {
  const [tool, setTool] = useState("Select");
  const [createdNodes, setCreatedNodes] = useState(0);
  const selectTool = (nextTool: string) => {
    setTool(nextTool);
    onFeedback(`${nextTool} tool active`);
  };
  return (
    <WorkspaceToolbar>
      <Button
        active={tool === "Select"}
        minimal
        icon="select"
        text="Select"
        onClick={() => selectTool("Select")}
      />
      <Button
        active={tool === "Pan"}
        minimal
        icon="hand"
        text="Pan"
        onClick={() => selectTool("Pan")}
      />
      <span className="wiki-toolbar-spacer" />
      <span className="wiki-toolbar-readout mono-data">{tool}</span>
      <Button
        icon="plus"
        intent="primary"
        text={`Add node${createdNodes ? ` · ${createdNodes}` : ""}`}
        onClick={() => {
          setCreatedNodes((count) => count + 1);
          onFeedback("Node added to workspace");
        }}
      />
    </WorkspaceToolbar>
  );
}

function WorkspaceBottomToolbarDemo({ onFeedback }: ComponentDemoProps) {
  const [zoom, setZoom] = useState(100);
  const changeZoom = (delta: number) => {
    setZoom((value) => Math.min(200, Math.max(25, value + delta)));
    onFeedback(delta > 0 ? "Zoom increased" : "Zoom decreased");
  };
  return (
    <WorkspaceBottomToolbar>
      <span className="mono-data">x: 1284.22&nbsp;&nbsp; y: 842.11</span>
      <span className="wiki-toolbar-spacer" />
      <Button
        aria-label="Zoom out"
        minimal
        icon="zoom-out"
        onClick={() => changeZoom(-25)}
      />
      <span className="mono-data">{zoom}%</span>
      <Button
        aria-label="Zoom in"
        minimal
        icon="zoom-in"
        onClick={() => changeZoom(25)}
      />
    </WorkspaceBottomToolbar>
  );
}

function InspectorWorkspaceDemo() {
  return (
    <InspectorWorkspace ariaLabel="Node inspector" className="wiki-inspector">
      <header>NODE INSPECTOR</header>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>API service</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusLed status="online" /> Online
          </dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>eu-central-1</dd>
        </div>
      </dl>
    </InspectorWorkspace>
  );
}

export const reusableComponentDemos = {
  DemoFrame: DemoFrameDemo,
  EmptyState: EmptyStateDemo,
  ExpandableSearchField: ExpandableSearchFieldDemo,
  FilterPill: FilterPillDemo,
  InspectorWorkspace: InspectorWorkspaceDemo,
  SearchField: SearchFieldDemo,
  SegmentedControl: SegmentedControlDemo,
  SelectableList: SelectableListDemo,
  StatusLed: StatusLedDemo,
  Tabs: TabsDemo,
  WorkspaceBottomToolbar: WorkspaceBottomToolbarDemo,
  WorkspaceToolbar: WorkspaceToolbarDemo,
} satisfies ComponentDemoRegistry;
