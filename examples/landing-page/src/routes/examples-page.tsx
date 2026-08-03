import { useState, type FormEvent } from "react";
import { Icon } from "@kantzen-ui/ui";
import { useParams } from "react-router-dom";
import {
  LandingFooter,
  LandingHeader,
  type LandingPageProps,
} from "./landing-page";
import { WorkspaceDemo } from "./workspace-demo";
import "./examples-page.css";

const examples = [
  { id: "login", title: "User login" },
  { id: "workspace", title: "Operations workspace" },
  { id: "projects", title: "Project board" },
] as const;

type ExampleId = (typeof examples)[number]["id"];

const projectColumns = [
  {
    title: "To do",
    tasks: [
      ["Audit analytics setup", "MC", "May 28"],
      ["Define IA for new site", "ES", "May 31"],
      ["Design system v2 tokens", "NW", "Jun 02"],
    ],
  },
  {
    title: "In progress",
    tasks: [
      ["Create homepage wireframes", "AP", "May 27"],
      ["Implement header component", "MC", "May 29"],
      ["Build pricing page", "ES", "Jun 03"],
    ],
  },
  {
    title: "Done",
    tasks: [
      ["Stakeholder kickoff", "NW", "May 10"],
      ["Competitive analysis", "AP", "May 14"],
      ["Old site content audit", "MC", "May 16"],
    ],
  },
] as const;

function KantzenWordmark() {
  return (
    <span className="example-wordmark">
      <span>K</span>
      <strong>Kantzen</strong>
    </span>
  );
}

function LoginThumbnail() {
  return (
    <div className="gallery-thumb gallery-thumb--login" aria-hidden="true">
      <div className="gallery-login-card">
        <span className="gallery-login-mark">K</span>
        <strong>Welcome back</strong>
        <span className="gallery-login-input" />
        <span className="gallery-login-input" />
        <span className="gallery-login-submit" />
      </div>
    </div>
  );
}

function WorkspaceThumbnail() {
  return (
    <div className="gallery-thumb gallery-thumb--app" aria-hidden="true">
      <aside>
        <span className="gallery-thumb-mark">K</span>
        <i className="is-active" />
        <i />
        <i />
        <i />
      </aside>
      <div className="gallery-workspace-main">
        <header>
          <strong>Operations overview</strong>
          <span />
        </header>
        <div className="gallery-workspace-stats">
          <span><i />28</span>
          <span><i />03</span>
          <span><i />98.7%</span>
        </div>
        <div className="gallery-workspace-chart">
          <svg viewBox="0 0 240 60" preserveAspectRatio="none">
            <path d="M0 50 38 42 76 35 114 46 152 22 190 31 240 12" />
          </svg>
        </div>
        <div className="gallery-workspace-rows">
          {[0, 1, 2, 3].map((row) => <span key={row}><i /><b /></span>)}
        </div>
      </div>
    </div>
  );
}

function ProjectThumbnail() {
  return (
    <div className="gallery-thumb gallery-thumb--app" aria-hidden="true">
      <aside>
        <span className="gallery-thumb-mark">K</span>
        <i className="is-active" />
        <i />
        <i />
      </aside>
      <div className="gallery-board-main">
        <header>
          <strong>Website redesign</strong>
          <span />
        </header>
        <div className="gallery-board-columns">
          {[0, 1, 2].map((column) => (
            <section key={column}>
              <i />
              <span />
              <span />
              <span />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryThumbnail({ id }: { id: ExampleId }) {
  if (id === "login") return <LoginThumbnail />;
  if (id === "workspace") return <WorkspaceThumbnail />;
  return <ProjectThumbnail />;
}

export function ExamplesPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page examples-page">
      <LandingHeader activeItem="examples" onNavigate={onNavigate} />
      <main className="examples-main" id="top">
        <header className="examples-intro">
          <h1>Examples</h1>
          <p>Three complete interfaces built with the same system.</p>
        </header>

        <section className="example-gallery" aria-label="Interface examples">
          {examples.map((example) => (
            <button
              className="example-gallery-tile"
              key={example.id}
              type="button"
              onClick={() => onNavigate(`/examples/${example.id}`)}
            >
              <GalleryThumbnail id={example.id} />
              <span className="example-gallery-title">
                <strong>{example.title}</strong>
                <Icon icon="arrow-right" size={14} />
              </span>
            </button>
          ))}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function ExampleTopBar({ onBack }: { onBack: () => void }) {
  return (
    <header className="example-topbar">
      <button type="button" onClick={onBack}>
        <Icon icon="arrow-left" size={13} />
        Back to examples
      </button>
    </header>
  );
}

function LoginExample() {
  const [showPassword, setShowPassword] = useState(false);
  const [remembered, setRemembered] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignedIn(true);
  };

  return (
    <main className="login-example-page">
      <form className="login-example-form" onSubmit={handleSubmit}>
        <KantzenWordmark />
        <div className="login-example-heading">
          <h1>{signedIn ? "Welcome, Jane." : "Welcome back"}</h1>
          <p>
            {signedIn
              ? "You are signed in to your workspace."
              : "Sign in to continue to your account."}
          </p>
        </div>

        {signedIn ? (
          <button
            className="login-example-primary"
            type="button"
            onClick={() => setSignedIn(false)}
          >
            Sign out
          </button>
        ) : (
          <>
            <label>
              Email address
              <span className="login-example-input">
                <Icon icon="envelope" size={15} />
                <input defaultValue="jane@kantzen.dev" type="email" />
              </span>
            </label>
            <label>
              Password
              <span className="login-example-input">
                <Icon icon="lock" size={15} />
                <input
                  defaultValue="kantzen-demo"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <Icon icon="eye-open" size={14} />
                </button>
              </span>
            </label>
            <div className="login-example-options">
              <label>
                <input
                  checked={remembered}
                  type="checkbox"
                  onChange={(event) => setRemembered(event.target.checked)}
                />
                <span aria-hidden="true">
                  {remembered ? <Icon icon="tick" size={10} /> : null}
                </span>
                Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
            <button className="login-example-primary" type="submit">
              Sign in
            </button>
            <div className="login-example-divider">
              <span /> or continue with <span />
            </div>
            <button className="login-example-secondary" type="button">
              Continue with GitHub
            </button>
          </>
        )}
      </form>
    </main>
  );
}

function DashboardSidebar() {
  const labels = ["Projects", "My tasks", "Calendar", "Files", "Settings"];

  return (
    <aside className="example-app-sidebar">
      <KantzenWordmark />
      <nav aria-label="Project navigation">
        {labels.map((label, index) => (
          <button
            className={index === 0 ? "is-active" : undefined}
            key={label}
            type="button"
          >
            <span />
            {label}
          </button>
        ))}
      </nav>
      <div className="example-app-user">
        <span>JD</span>
        <span>
          Jane Doe<small>Project lead</small>
        </span>
      </div>
    </aside>
  );
}

function ProjectExample() {
  const [filtered, setFiltered] = useState(false);

  return (
    <main className="project-example-page">
      <DashboardSidebar />
      <section className="project-example-content">
        <header className="example-app-heading project-example-heading">
          <div>
            <span>Project</span>
            <h1>Website redesign</h1>
          </div>
          <div>
            <button
              className={filtered ? "is-active" : undefined}
              type="button"
              onClick={() => setFiltered((active) => !active)}
            >
              <Icon icon="filter" size={13} />
              {filtered ? "Filtered" : "Filter"}
            </button>
            <button className="is-primary" type="button">
              <Icon icon="add" size={13} /> New task
            </button>
          </div>
        </header>

        <nav className="project-example-tabs" aria-label="Project views">
          <button className="is-active" type="button">
            Board
          </button>
          <button type="button">List</button>
          <button type="button">Timeline</button>
          <button type="button">Files</button>
        </nav>

        <div className="project-example-board">
          {projectColumns.map((column, columnIndex) => (
            <section key={column.title}>
              <header>
                <strong>{column.title}</strong>
                <span>{column.tasks.length}</span>
                <button
                  aria-label={`Add task to ${column.title}`}
                  type="button"
                >
                  <Icon icon="add" size={12} />
                </button>
              </header>
              {column.tasks
                .filter((_, index) => !filtered || index < 2)
                .map(([title, owner, date]) => (
                  <article key={title}>
                    <strong>{title}</strong>
                    <p>Prepare the next iteration for team review.</p>
                    <footer>
                      <i className={columnIndex === 2 ? "is-done" : undefined}>
                        {columnIndex === 2 ? (
                          <Icon icon="tick" size={10} />
                        ) : (
                          owner
                        )}
                      </i>
                      <span>{date}</span>
                      <span>2 notes</span>
                    </footer>
                  </article>
                ))}
              <button className="project-example-add" type="button">
                <Icon icon="add" size={11} /> Add task
              </button>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ExamplePage({ onNavigate }: LandingPageProps) {
  const { exampleId } = useParams<{ exampleId: string }>();
  const selected = examples.find((example) => example.id === exampleId);

  return (
    <div className="landing-page example-detail-page">
      <ExampleTopBar onBack={() => onNavigate("/examples")} />
      {selected?.id === "login" ? <LoginExample /> : null}
      {selected?.id === "workspace" ? <WorkspaceDemo /> : null}
      {selected?.id === "projects" ? <ProjectExample /> : null}
      {!selected ? (
        <main className="example-not-found">
          <h1>Example not found.</h1>
          <button type="button" onClick={() => onNavigate("/examples")}>
            Return to examples
          </button>
        </main>
      ) : null}
    </div>
  );
}
