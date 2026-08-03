import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@kantzen-ui/ui";
import {
  LandingFooter,
  LandingHeader,
  type LandingPageProps,
} from "./landing-page";
import "./examples-page.css";

interface GalleryCaptionProps {
  description: string;
  index: string;
  label: string;
  onOpen: () => void;
  title: string;
}

const adminRows = [
  ["Maya Chen", "maya@northstar.dev", "Admin", "Active"],
  ["Elliot Stone", "elliot@northstar.dev", "Editor", "Active"],
  ["Noah Williams", "noah@northstar.dev", "Viewer", "Invited"],
] as const;

const projectColumns = [
  {
    title: "To do",
    count: 4,
    tasks: [
      ["Audit analytics setup", "MC", "May 28", "2"],
      ["Define IA for new site", "ES", "May 31", "1"],
      ["Design system v2 tokens", "NW", "Jun 02", "3"],
    ],
  },
  {
    title: "In progress",
    count: 3,
    tasks: [
      ["Create homepage wireframes", "AP", "May 27", "2"],
      ["Implement header component", "MC", "May 29", "4"],
      ["Build pricing page", "ES", "Jun 03", "1"],
    ],
  },
  {
    title: "Done",
    count: 3,
    tasks: [
      ["Stakeholder kickoff", "NW", "May 10", "0"],
      ["Competitive analysis", "AP", "May 14", "0"],
      ["Old site content audit", "MC", "May 16", "0"],
    ],
  },
] as const;

function GalleryCaption({
  description,
  index,
  label,
  onOpen,
  title,
}: GalleryCaptionProps) {
  return (
    <div className="example-gallery-caption">
      <div>
        <span className="example-gallery-index">
          {index} / {label}
        </span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button type="button" onClick={onOpen}>
        Open example
        <Icon icon="arrow-right" size={13} />
      </button>
    </div>
  );
}

function PreviewNavItem({
  active = false,
  children,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  icon: "grid-view" | "people" | "folder-open" | "credit-card" | "cog";
}) {
  return (
    <button
      className={active ? "is-active" : undefined}
      tabIndex={-1}
      type="button"
    >
      <Icon icon={icon} size={11} />
      <span>{children}</span>
    </button>
  );
}

function LoginPreview() {
  const [showPassword, setShowPassword] = useState(false);
  const [remembered, setRemembered] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="example-preview example-login-preview">
      <div className="login-demo">
        <div className="login-demo-brand">
          <span className="login-demo-mark">K</span>
          <strong>Kantzen</strong>
        </div>
        <div className="login-demo-heading">
          <h3>{submitted ? "You’re signed in." : "Welcome back"}</h3>
          <p>
            {submitted
              ? "Your workspace is ready."
              : "Sign in to continue to your account."}
          </p>
        </div>
        {submitted ? (
          <button
            className="login-demo-submit"
            type="button"
            onClick={() => setSubmitted(false)}
          >
            Return to sign in
          </button>
        ) : (
          <form onSubmit={submit}>
            <label>
              Email address
              <span className="login-demo-input">
                <Icon icon="envelope" size={13} />
                <input
                  aria-label="Example email address"
                  defaultValue="jane@kantzen.dev"
                  type="email"
                />
              </span>
            </label>
            <label>
              Password
              <span className="login-demo-input">
                <Icon icon="lock" size={13} />
                <input
                  aria-label="Example password"
                  defaultValue="kantzen-demo"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <Icon icon="eye-open" size={13} />
                </button>
              </span>
            </label>
            <div className="login-demo-options">
              <label>
                <input
                  checked={remembered}
                  type="checkbox"
                  onChange={(event) => setRemembered(event.target.checked)}
                />
                <span aria-hidden="true">
                  {remembered ? <Icon icon="tick" size={9} /> : null}
                </span>
                Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
            <button className="login-demo-submit" type="submit">
              Sign in
            </button>
            <div className="login-demo-divider">
              <span /> or continue with <span />
            </div>
            <button className="login-demo-sso" type="button">
              <span aria-hidden="true">GH</span>
              Continue with GitHub
            </button>
          </form>
        )}
        <p className="login-demo-footnote">
          Don’t have an account? <button type="button">Create one</button>
        </p>
      </div>
    </div>
  );
}

function AdminPreview() {
  const [range, setRange] = useState<"30d" | "90d">("30d");

  return (
    <div className="example-preview admin-demo">
      <aside className="preview-sidebar">
        <div className="preview-sidebar-brand">
          <span>K</span>
          <strong>Kantzen</strong>
        </div>
        <nav aria-label="Admin preview navigation">
          <PreviewNavItem active icon="grid-view">
            Overview
          </PreviewNavItem>
          <PreviewNavItem icon="people">Users</PreviewNavItem>
          <PreviewNavItem icon="folder-open">Projects</PreviewNavItem>
          <PreviewNavItem icon="credit-card">Billing</PreviewNavItem>
          <PreviewNavItem icon="cog">Settings</PreviewNavItem>
        </nav>
        <div className="preview-sidebar-user">
          <span>JD</span>
          <span>
            Jane Doe<small>Administrator</small>
          </span>
        </div>
      </aside>
      <div className="admin-demo-main">
        <header>
          <div>
            <span>Operations</span>
            <h3>Overview</h3>
          </div>
          <div className="admin-demo-tools">
            <button
              className={range === "30d" ? "is-active" : undefined}
              type="button"
              onClick={() => setRange("30d")}
            >
              30 days
            </button>
            <button
              className={range === "90d" ? "is-active" : undefined}
              type="button"
              onClick={() => setRange("90d")}
            >
              90 days
            </button>
            <button aria-label="Notifications" type="button">
              <Icon icon="notifications" size={12} />
            </button>
          </div>
        </header>
        <div className="admin-demo-stats">
          <div>
            <span>Total revenue</span>
            <strong>{range === "30d" ? "$152,430" : "$428,912"}</strong>
            <small>↑ 12.4%</small>
          </div>
          <div>
            <span>Active users</span>
            <strong>{range === "30d" ? "2,845" : "7,291"}</strong>
            <small>↑ 8.7%</small>
          </div>
          <div>
            <span>New signups</span>
            <strong>{range === "30d" ? "342" : "918"}</strong>
            <small>↑ 15.3%</small>
          </div>
        </div>
        <div className="admin-demo-chart">
          <div>
            <strong>Revenue over time</strong>
            <span>{range === "30d" ? "May 01–31" : "Mar 01–May 31"}</span>
          </div>
          <svg
            viewBox="0 0 520 115"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="chart-grid"
              d="M0 22.5H520M0 57.5H520M0 92.5H520"
            />
            <path
              className="chart-area"
              d="M0 96 38 84 72 70 112 76 150 54 184 62 225 42 260 50 302 35 344 46 382 27 421 34 468 13 520 20V115H0Z"
            />
            <path
              className="chart-line"
              d="M0 96 38 84 72 70 112 76 150 54 184 62 225 42 260 50 302 35 344 46 382 27 421 34 468 13 520 20"
            />
          </svg>
        </div>
        <div className="admin-demo-table">
          <div className="admin-demo-table-title">
            <strong>Recent users</strong>
            <button type="button">View all</button>
          </div>
          <div className="admin-demo-row is-header">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {adminRows.map(([name, email, role, status], index) => (
            <div className="admin-demo-row" key={email}>
              <span>
                <i>{["MC", "ES", "NW"][index]}</i>
                {name}
              </span>
              <span>{email}</span>
              <span>{role}</span>
              <span className={status === "Active" ? "is-online" : undefined}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectBoardPreview() {
  const [filtered, setFiltered] = useState(false);

  return (
    <div className="example-preview project-demo">
      <aside className="preview-sidebar project-demo-sidebar">
        <div className="preview-sidebar-brand">
          <span>K</span>
          <strong>Kantzen</strong>
        </div>
        <span className="project-demo-workspace">WORKSPACE</span>
        <strong className="project-demo-team">Team Northstar</strong>
        <nav aria-label="Project board preview navigation">
          <PreviewNavItem active icon="folder-open">
            Projects
          </PreviewNavItem>
          <PreviewNavItem icon="grid-view">My tasks</PreviewNavItem>
          <PreviewNavItem icon="people">Team</PreviewNavItem>
          <PreviewNavItem icon="cog">Settings</PreviewNavItem>
        </nav>
      </aside>
      <div className="project-demo-main">
        <header>
          <div>
            <span>Project</span>
            <h3>Website redesign</h3>
          </div>
          <div className="project-demo-actions">
            <span className="project-demo-avatars">MC&nbsp; ES&nbsp; +3</span>
            <button
              className={filtered ? "is-active" : undefined}
              type="button"
              onClick={() => setFiltered((active) => !active)}
            >
              <Icon icon="filter" size={11} />
              {filtered ? "Filtered" : "Filter"}
            </button>
            <button type="button">
              <Icon icon="add" size={11} /> New task
            </button>
          </div>
        </header>
        <div className="project-demo-tabs">
          <button className="is-active" type="button">
            Board
          </button>
          <button type="button">List</button>
          <button type="button">Timeline</button>
          <button type="button">Files</button>
        </div>
        <div className="project-demo-board">
          {projectColumns.map((column, columnIndex) => (
            <section key={column.title}>
              <header>
                <strong>{column.title}</strong>
                <span>{column.count}</span>
                <button
                  aria-label={`Add task to ${column.title}`}
                  type="button"
                >
                  <Icon icon="add" size={10} />
                </button>
              </header>
              {column.tasks
                .filter((_, taskIndex) => !filtered || taskIndex < 2)
                .map(([title, owner, date, comments]) => (
                  <article key={title}>
                    <strong>{title}</strong>
                    <footer>
                      <i className={columnIndex === 2 ? "is-done" : undefined}>
                        {columnIndex === 2 ? (
                          <Icon icon="tick" size={9} />
                        ) : (
                          owner
                        )}
                      </i>
                      <span>{date}</span>
                      <span>{comments} notes</span>
                    </footer>
                  </article>
                ))}
              <button className="project-demo-add" type="button">
                <Icon icon="add" size={10} /> Add task
              </button>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExamplesPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page examples-page">
      <LandingHeader activeItem="examples" onNavigate={onNavigate} />
      <main className="examples-main" id="top">
        <header className="examples-intro">
          <h1>Real interfaces. One system.</h1>
          <p>
            Three complete product surfaces, composed from the same components,
            tokens, and interaction patterns.
          </p>
        </header>

        <section className="example-gallery" aria-label="Interface examples">
          <article className="example-gallery-item example-gallery-item--login">
            <LoginPreview />
            <GalleryCaption
              description="A focused authentication flow with usable form states and keyboard-ready controls."
              index="01"
              label="ACCESS"
              title="User login"
              onOpen={() => onNavigate("/workspace")}
            />
          </article>

          <article className="example-gallery-item example-gallery-item--admin">
            <AdminPreview />
            <GalleryCaption
              description="Navigation, metrics, trends, and user management in one compact operational view."
              index="02"
              label="OPERATIONS"
              title="Admin dashboard"
              onOpen={() => onNavigate("/workspace")}
            />
          </article>

          <article className="example-gallery-item example-gallery-item--project">
            <ProjectBoardPreview />
            <GalleryCaption
              description="A dense planning surface for moving team work from backlog to shipped."
              index="03"
              label="PLANNING"
              title="Project board"
              onOpen={() => onNavigate("/workspace")}
            />
          </article>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
