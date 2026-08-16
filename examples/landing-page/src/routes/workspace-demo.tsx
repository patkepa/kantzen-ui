import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Icon,
  SearchField,
  StatusLed,
  Tabs,
  WorkspaceToolbar,
} from "@patkepa/kantzen-ui";
import { WorkspacePortal, WorkspaceShell } from "@patkepa/kantzen-ui/app-shell";
import {
  workspaceNavGroups,
  workspaceProjects,
  workspaceUser,
} from "../fixtures/workspace-nav";
import "./workspace-demo.css";

type WorkspaceStatus = "online" | "warning" | "offline";
type WorkspaceFilter = "all" | WorkspaceStatus;
type WorkspaceTab = "overview" | "activity" | "health";
type ChartRange = "7d" | "30d";

interface Workstream {
  id: string;
  name: string;
  description: string;
  latestEvent: string;
  owner: string;
  ownerInitials: string;
  progress: number;
  region: string;
  status: WorkspaceStatus;
  updated: string;
}

const initialWorkstreams: Workstream[] = [
  {
    id: "north-rollout",
    name: "North region rollout",
    description:
      "Expanding coverage across the northern corridor with new edge sites and backhaul upgrades.",
    latestEvent: "Site online: NA-SEA-04",
    owner: "Field Ops",
    ownerInitials: "FO",
    progress: 62,
    region: "North America",
    status: "online",
    updated: "2m ago",
  },
  {
    id: "gateway-migration",
    name: "Customer gateway migration",
    description:
      "Moving customer gateways to the new control plane with staged validation and rollback coverage.",
    latestEvent: "Latency threshold exceeded",
    owner: "Success",
    ownerInitials: "SC",
    progress: 41,
    region: "Europe",
    status: "warning",
    updated: "18m ago",
  },
  {
    id: "backhaul-audit",
    name: "Backhaul audit",
    description:
      "Reviewing route health, failover coverage, and utilization across priority network corridors.",
    latestEvent: "Audit batch 12 completed",
    owner: "Network",
    ownerInitials: "NW",
    progress: 78,
    region: "APAC",
    status: "online",
    updated: "1h ago",
  },
  {
    id: "legacy-cleanup",
    name: "Legacy route cleanup",
    description:
      "Retiring obsolete route definitions after the final dependency and customer-impact review.",
    latestEvent: "Route check failed",
    owner: "Support",
    ownerInitials: "SP",
    progress: 15,
    region: "South America",
    status: "offline",
    updated: "2h ago",
  },
];

const activityItems = [
  {
    id: "site-online",
    title: "Site online: NA-SEA-04",
    meta: "10:24 · Alex Morgan",
    status: "online" as const,
  },
  {
    id: "latency",
    title: "High latency detected",
    meta: "09:41 · Automated monitor",
    status: "warning" as const,
  },
  {
    id: "config",
    title: "Config deployed: v1.23.4",
    meta: "08:15 · Jamie Kim",
    status: "online" as const,
  },
  {
    id: "created",
    title: "Workstream created",
    meta: "Yesterday · Jamie Kim",
    status: "neutral" as const,
  },
];

const healthServices = [
  ["Control plane", "99.99%", "18 ms", "online"],
  ["Edge network", "99.97%", "26 ms", "online"],
  ["Event pipeline", "99.91%", "84 ms", "warning"],
  ["Customer API", "99.98%", "31 ms", "online"],
] as const;

const statusLabels: Record<WorkspaceStatus, string> = {
  online: "Online",
  warning: "Attention",
  offline: "Offline",
};

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "health", label: "Health" },
] as const;

function Metric({
  icon,
  label,
  note,
  tone,
  value,
}: {
  icon: "cloud" | "warning-sign" | "pulse";
  label: string;
  note: string;
  tone: "blue" | "red" | "green";
  value: string;
}) {
  return (
    <div className={`workspace-metric workspace-metric--${tone}`}>
      <span className="workspace-metric-icon" aria-hidden="true">
        <Icon icon={icon} size={22} />
      </span>
      <span>
        <strong className="mono-data">{value}</strong>
        <span>{label}</span>
        <small>{note}</small>
      </span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <span className="workspace-progress" aria-label={`${value}% complete`}>
      <span style={{ width: `${value}%` }} />
      <em className="mono-data">{value}%</em>
    </span>
  );
}

function StatusLabel({ status }: { status: WorkspaceStatus }) {
  return (
    <span className="workspace-status-label">
      <StatusLed status={status} />
      {statusLabels[status]}
    </span>
  );
}

function DeploymentChart({
  range,
  onRangeChange,
}: {
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}) {
  const path =
    range === "7d"
      ? "M16 132 L146 112 L276 90 L406 126 L536 68 L666 88 L796 48"
      : "M16 136 L86 128 L156 114 L226 120 L296 94 L366 104 L436 78 L506 82 L576 62 L646 70 L716 42 L796 50";

  return (
    <section className="workspace-chart" aria-labelledby="deployment-trend">
      <header>
        <div>
          <strong id="deployment-trend">Deployment trend</strong>
          <span>Active workstreams and rolling baseline</span>
        </div>
        <div className="workspace-chart-range" aria-label="Chart range">
          {(["7d", "30d"] as const).map((item) => (
            <button
              aria-pressed={range === item}
              className={range === item ? "is-active" : undefined}
              key={item}
              onClick={() => onRangeChange(item)}
              type="button"
            >
              {item === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </header>
      <div className="workspace-chart-legend" aria-hidden="true">
        <span>
          <i /> Active deployments
        </span>
        <span>
          <i /> Rolling baseline
        </span>
      </div>
      <svg viewBox="0 0 812 176" role="img" aria-label="Deployment trend chart">
        <path
          className="workspace-chart-grid"
          d="M16 24H796M16 68H796M16 112H796M16 156H796"
        />
        <path
          className="workspace-chart-baseline"
          d="M16 128 L146 116 L276 104 L406 96 L536 88 L666 80 L796 74"
        />
        <path
          className="workspace-chart-area"
          d={`${path} L796 156 L16 156 Z`}
        />
        <path className="workspace-chart-line" d={path} />
        {[16, 146, 276, 406, 536, 666, 796].map((x, index) => (
          <circle
            cx={x}
            cy={[132, 112, 90, 126, 68, 88, 48][index]}
            key={x}
            r="3"
          />
        ))}
      </svg>
      <footer aria-hidden="true">
        {(range === "7d"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : ["Jul 5", "Jul 10", "Jul 15", "Jul 20", "Jul 25", "Jul 30", "Aug 3"]
        ).map((label) => (
          <span key={label}>{label}</span>
        ))}
      </footer>
    </section>
  );
}

function Filters({
  active,
  counts,
  onChange,
}: {
  active: WorkspaceFilter;
  counts: Record<WorkspaceFilter, number>;
  onChange: (filter: WorkspaceFilter) => void;
}) {
  const filters: Array<{ id: WorkspaceFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "online", label: "Online" },
    { id: "warning", label: "Attention" },
    { id: "offline", label: "Offline" },
  ];

  return (
    <div className="workspace-filters" aria-label="Filter workstreams">
      {filters.map((filter) => (
        <button
          aria-pressed={active === filter.id}
          className={active === filter.id ? "is-active" : undefined}
          key={filter.id}
          onClick={() => onChange(filter.id)}
          type="button"
        >
          {filter.id !== "all" ? <StatusLed status={filter.id} /> : null}
          <span>{filter.label}</span>
          <em className="mono-data">{counts[filter.id]}</em>
        </button>
      ))}
    </div>
  );
}

function WorkstreamTable({
  rows,
  selectedId,
  onSelect,
}: {
  rows: Workstream[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="workspace-workstreams" aria-label="Workstreams">
      <div className="workspace-workstream-header" aria-hidden="true">
        <span>Workstream</span>
        <span>Region</span>
        <span>Progress</span>
        <span>Owner</span>
        <span>Status</span>
        <span>Updated</span>
      </div>
      {rows.length > 0 ? (
        rows.map((row) => (
          <button
            aria-pressed={row.id === selectedId}
            className={row.id === selectedId ? "is-selected" : undefined}
            key={row.id}
            onClick={() => onSelect(row.id)}
            type="button"
          >
            <strong>{row.name}</strong>
            <span>{row.region}</span>
            <ProgressBar value={row.progress} />
            <span className="workspace-owner">
              <i>{row.ownerInitials}</i>
              {row.owner}
            </span>
            <StatusLabel status={row.status} />
            <span className="mono-data">{row.updated}</span>
          </button>
        ))
      ) : (
        <div className="workspace-empty-result">
          <Icon icon="search" size={18} />
          <strong>No workstreams found</strong>
          <span>Try another search or status filter.</span>
        </div>
      )}
    </section>
  );
}

function ActivityView() {
  return (
    <div className="workspace-tab-view workspace-activity-view">
      <section>
        <header>
          <div>
            <strong>Live activity</strong>
            <span>Events across production workstreams</span>
          </div>
          <Button icon="refresh" minimal small text="Refresh" />
        </header>
        <div className="workspace-activity-timeline">
          {activityItems
            .concat(activityItems.slice(0, 2))
            .map((item, index) => (
              <button key={`${item.id}-${index}`} type="button">
                <span className={`workspace-event-icon is-${item.status}`}>
                  <Icon
                    icon={
                      item.status === "warning"
                        ? "warning-sign"
                        : item.status === "online"
                          ? "tick"
                          : "pulse"
                    }
                    size={13}
                  />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </span>
                <Icon icon="chevron-right" size={12} />
              </button>
            ))}
        </div>
      </section>
      <aside>
        <span className="section-label">Event volume</span>
        <strong className="mono-data">1,248</strong>
        <p>87% automated · 13% human initiated</p>
        <div className="workspace-volume-bars" aria-hidden="true">
          {[38, 54, 44, 68, 82, 61, 74, 92, 70, 84, 58, 76].map(
            (height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ),
          )}
        </div>
      </aside>
    </div>
  );
}

function HealthView() {
  return (
    <div className="workspace-tab-view workspace-health-view">
      <header>
        <div>
          <strong>System health</strong>
          <span>All production services · updated just now</span>
        </div>
        <span className="workspace-health-overall">
          <StatusLed status="online" /> Operational
        </span>
      </header>
      <div className="workspace-health-table">
        <div aria-hidden="true">
          <span>Service</span>
          <span>Availability</span>
          <span>Latency</span>
          <span>Status</span>
        </div>
        {healthServices.map(([service, availability, latency, status]) => (
          <button key={service} type="button">
            <strong>{service}</strong>
            <span className="mono-data">{availability}</span>
            <span className="mono-data">{latency}</span>
            <StatusLabel status={status} />
          </button>
        ))}
      </div>
      <section className="workspace-region-health">
        <header>
          <strong>Regional availability</strong>
          <span>Last 24 hours</span>
        </header>
        {["North America", "Europe", "Asia Pacific", "South America"].map(
          (region, index) => (
            <div key={region}>
              <span>{region}</span>
              <span className="workspace-uptime-track">
                <i style={{ width: `${[99, 96, 98, 91][index]}%` }} />
              </span>
              <strong className="mono-data">
                {["99.99%", "99.96%", "99.98%", "99.91%"][index]}
              </strong>
            </div>
          ),
        )}
      </section>
    </div>
  );
}

function DetailRail({ selected }: { selected: Workstream }) {
  return (
    <aside
      className="workspace-detail-rail"
      aria-label={`${selected.name} details`}
    >
      <header>
        <div>
          <span className="section-label">Selected workstream</span>
          <strong>{selected.name}</strong>
        </div>
        <Button
          aria-label="More workstream actions"
          icon="more"
          minimal
          small
        />
      </header>
      <dl>
        <div>
          <dt>Region</dt>
          <dd>{selected.region}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusLabel status={selected.status} />
          </dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>
            <ProgressBar value={selected.progress} />
          </dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd className="workspace-owner">
            <i>{selected.ownerInitials}</i>
            {selected.owner}
          </dd>
        </div>
      </dl>
      <section>
        <span className="section-label">Latest event</span>
        <button className="workspace-latest-event" type="button">
          <span className={`workspace-event-icon is-${selected.status}`}>
            <Icon
              icon={
                selected.status === "warning"
                  ? "warning-sign"
                  : selected.status === "offline"
                    ? "error"
                    : "tick"
              }
              size={13}
            />
          </span>
          <span>
            <strong>{selected.latestEvent}</strong>
            <small>Today at 10:24</small>
          </span>
          <Icon icon="chevron-right" size={12} />
        </button>
      </section>
      <section>
        <span className="section-label">Description</span>
        <p>{selected.description}</p>
      </section>
      <section className="workspace-rail-activity">
        <div className="workspace-rail-heading">
          <span className="section-label">Recent activity</span>
          <button type="button">View all</button>
        </div>
        {activityItems.slice(0, 3).map((item) => (
          <button key={item.id} type="button">
            <StatusLed status={item.status} />
            <span>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </span>
          </button>
        ))}
      </section>
    </aside>
  );
}

function CreateDeploymentDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (workstream: Workstream) => void;
}) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("North America");
  const [owner, setOwner] = useState("Field Ops");
  const [description, setDescription] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = name.trim();
    if (!safeName) return;
    onCreate({
      id: `deployment-${Date.now()}`,
      name: safeName,
      description:
        description.trim() ||
        "New deployment ready for planning and assignment.",
      latestEvent: "Workstream created",
      owner,
      ownerInitials: owner
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2),
      progress: 4,
      region,
      status: "online",
      updated: "now",
    });
  };

  return (
    <div
      className="workspace-dialog-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="new-deployment-title"
        aria-modal="true"
        className="workspace-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <span className="section-label">Create workstream</span>
            <h2 id="new-deployment-title">New deployment</h2>
          </div>
          <Button
            aria-label="Close dialog"
            icon="cross"
            minimal
            onClick={onClose}
          />
        </header>
        <form onSubmit={handleSubmit}>
          <label>
            Workstream name
            <input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. South region rollout"
              required
              value={name}
            />
          </label>
          <div className="workspace-dialog-columns">
            <label>
              Region
              <select
                onChange={(event) => setRegion(event.target.value)}
                value={region}
              >
                <option>North America</option>
                <option>Europe</option>
                <option>APAC</option>
                <option>South America</option>
              </select>
            </label>
            <label>
              Owner
              <select
                onChange={(event) => setOwner(event.target.value)}
                value={owner}
              >
                <option>Field Ops</option>
                <option>Success</option>
                <option>Network</option>
                <option>Support</option>
              </select>
            </label>
          </div>
          <label>
            Description <span>(optional)</span>
            <textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a short description"
              rows={4}
              value={description}
            />
          </label>
          <footer>
            <Button onClick={onClose} text="Cancel" />
            <Button
              intent="primary"
              icon="cloud-upload"
              text="Create deployment"
              type="submit"
            />
          </footer>
        </form>
      </section>
    </div>
  );
}

function NotificationMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="workspace-notification-menu" role="menu">
      <header>
        <strong>Notifications</strong>
        <button onClick={onClose} type="button">
          Mark all read
        </button>
      </header>
      {activityItems.slice(0, 3).map((item) => (
        <button key={item.id} role="menuitem" type="button">
          <StatusLed status={item.status} />
          <span>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function WorkspaceContent({ children }: { children: ReactNode }) {
  return <div className="workspace-demo-frame">{children}</div>;
}

export const WorkspaceDemo = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 900px)").matches,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WorkspaceFilter>("all");
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [range, setRange] = useState<ChartRange>("7d");
  const [workstreams, setWorkstreams] = useState<Workstream[]>(
    () => initialWorkstreams,
  );
  const [selectedId, setSelectedId] = useState(initialWorkstreams[0]?.id ?? "");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createdMessage, setCreatedMessage] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const counts = useMemo<Record<WorkspaceFilter, number>>(
    () => ({
      all: workstreams.length,
      online: workstreams.filter((row) => row.status === "online").length,
      warning: workstreams.filter((row) => row.status === "warning").length,
      offline: workstreams.filter((row) => row.status === "offline").length,
    }),
    [workstreams],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return workstreams.filter((row) => {
      const matchesStatus = filter === "all" || row.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        [row.name, row.region, row.owner].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, workstreams]);

  const selected =
    workstreams.find((row) => row.id === selectedId) ?? workstreams[0];

  const handleCreate = (workstream: Workstream) => {
    setWorkstreams((current) => [workstream, ...current]);
    setSelectedId(workstream.id);
    setFilter("all");
    setQuery("");
    setTab("overview");
    setIsCreateOpen(false);
    setCreatedMessage(`${workstream.name} was created.`);
    window.setTimeout(() => setCreatedMessage(""), 3200);
  };

  const activePath = location.pathname.startsWith("/workspace")
    ? location.pathname
    : "/workspace";

  return (
    <WorkspaceContent>
      <WorkspaceShell
        productName="Kantzen Workspace"
        collapsedProductName="KW"
        currentPath={activePath}
        navGroups={workspaceNavGroups}
        sidebarCollapsed={sidebarCollapsed}
        onNavigate={navigate}
        onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
        breadcrumb={
          <>
            <span className="breadcrumb-link">Workspace</span>
            <span className="breadcrumb-sep">/</span>
            <span>Overview</span>
          </>
        }
        navBadges={{
          Deployments: { count: 12 },
          Fleet: { status: "online" },
          Alerts: { count: 3 },
        }}
        projects={workspaceProjects}
        user={workspaceUser}
        version="v0.1.0"
        onOpenCommandPalette={() => searchRef.current?.focus()}
      >
        <WorkspacePortal slot="topbar">
          <WorkspaceToolbar
            ariaLabel="Workspace overview controls"
            className="workspace-demo-toolbar"
          >
            <SearchField
              ariaLabel="Search deployments, owners, or regions"
              inputRef={searchRef}
              onChange={setQuery}
              placeholder="Search deployments, owners, or regions"
              value={query}
            />
            <div className="workspace-toolbar-actions">
              <Button
                icon="filter"
                onClick={() => setFilter(filter === "all" ? "warning" : "all")}
                text={filter === "all" ? "Filter" : statusLabels[filter]}
              />
              <Button
                intent="primary"
                icon="add"
                onClick={() => setIsCreateOpen(true)}
                text="New deployment"
              />
            </div>
          </WorkspaceToolbar>
        </WorkspacePortal>
        <WorkspacePortal slot="navbar-end">
          <div className="workspace-notification-control">
            <Button
              aria-expanded={notificationsOpen}
              aria-label="Notifications, 3 unread"
              icon="notifications"
              minimal
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            <span className="workspace-notification-badge">3</span>
            {notificationsOpen ? (
              <NotificationMenu onClose={() => setNotificationsOpen(false)} />
            ) : null}
          </div>
        </WorkspacePortal>

        <div className="workspace-demo-page">
          <header className="workspace-demo-heading">
            <div>
              <span className="section-label">Production environment</span>
              <h1>Operations overview</h1>
              <p>
                Monitor deployments, service health, and field activity from one
                place.
              </p>
            </div>
            <div className="workspace-live-indicator">
              <StatusLed status="online" />
              <span>Live</span>
              <small>Updated just now</small>
            </div>
          </header>

          <section
            className="workspace-demo-summary"
            aria-label="Operations summary"
          >
            <Metric
              icon="cloud"
              label="Active deployments"
              note="↑ 4 vs last 7 days"
              tone="blue"
              value="28"
            />
            <Metric
              icon="warning-sign"
              label="Incidents"
              note="↑ 1 vs last 7 days"
              tone="red"
              value="03"
            />
            <Metric
              icon="pulse"
              label="Signal quality"
              note="↑ 1.2% vs last 7 days"
              tone="green"
              value="98.7%"
            />
          </section>

          <Tabs
            ariaLabel="Workspace views"
            className="workspace-demo-tabs"
            items={tabItems}
            onChange={setTab}
            value={tab}
          />

          <div className="workspace-demo-layout">
            <main className="workspace-demo-primary">
              {tab === "overview" ? (
                <>
                  <div className="workspace-overview-controls">
                    <Filters
                      active={filter}
                      counts={counts}
                      onChange={setFilter}
                    />
                    <span>{filteredRows.length} visible workstreams</span>
                  </div>
                  <DeploymentChart onRangeChange={setRange} range={range} />
                  <WorkstreamTable
                    onSelect={setSelectedId}
                    rows={filteredRows}
                    selectedId={selected?.id ?? ""}
                  />
                </>
              ) : null}
              {tab === "activity" ? <ActivityView /> : null}
              {tab === "health" ? <HealthView /> : null}
            </main>
            {selected ? <DetailRail selected={selected} /> : null}
          </div>
        </div>

        {isCreateOpen ? (
          <CreateDeploymentDialog
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreate}
          />
        ) : null}
        {createdMessage ? (
          <div className="workspace-toast" role="status">
            <Icon icon="tick" size={13} />
            {createdMessage}
          </div>
        ) : null}
      </WorkspaceShell>
    </WorkspaceContent>
  );
};
