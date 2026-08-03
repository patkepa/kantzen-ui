import { useEffect, useState } from "react";
import { Button, Icon } from "@kantzen-ui/ui";
import {
  BrandMark,
  CommandWorkbench,
  LandingFooter,
  LandingHeader,
  type LandingPageProps,
} from "./landing-page";
import "./motivation-page.css";

const principles = [
  {
    id: "point-of-view",
    number: "01",
    title: "A system should have a point of view.",
    summary: "Consistency is useful. Character is what makes it memorable.",
    detail:
      "Kantzen sets a clear visual and interaction baseline, then leaves enough room for a product to sound like itself. The goal is coherent software, not anonymous software.",
  },
  {
    id: "whole-product",
    number: "02",
    title: "The whole product deserves one language.",
    summary:
      "Public story, daily workspace, and complex tools belong together.",
    detail:
      "The marketing surface and the operational surface should not feel like separate companies. Shared tokens, typography, density, and interaction patterns keep the promise connected to the work.",
  },
  {
    id: "hard-details",
    number: "03",
    title: "The hard details should arrive early.",
    summary: "Focus, keyboard paths, density, and state are design material.",
    detail:
      "Responsive behavior and interaction states are not cleanup tasks. Kantzen brings them into the first conversation, where they can shape the interface instead of merely patching it.",
  },
] as const;

type Principle = (typeof principles)[number];

const commitments = [
  [
    "01",
    "Expressive, not ornamental",
    "Every visual choice should clarify hierarchy, intent, or identity.",
  ],
  [
    "02",
    "Dense, not crowded",
    "Serious tools can hold more information without making attention expensive.",
  ],
  [
    "03",
    "Reusable, not generic",
    "A primitive earns its place by supporting variation without erasing character.",
  ],
  [
    "04",
    "Finished in the details",
    "Focus, motion, empty states, and responsive behavior are part of the component.",
  ],
] as const;

export function MotivationPage({ onNavigate }: LandingPageProps) {
  const [activePrinciple, setActivePrinciple] = useState<Principle>(
    principles[0],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = description?.content;

    document.title = "Why Kantzen UI — Motivation";
    if (description) {
      description.content =
        "Why Kantzen UI treats character, interaction detail, and the whole product surface as one design problem.";
    }

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) {
        description.content = previousDescription;
      }
    };
  }, []);

  return (
    <div className="landing-page motivation-page">
      <LandingHeader onNavigate={onNavigate} />
      <main>
        <section className="motivation-hero" id="top">
          <div className="motivation-hero-copy">
            <h1>
              Good interfaces
              <br />
              are not neutral.
            </h1>
            <p>
              They reveal what matters, make difficult work feel legible, and
              give a product a voice people can recognize.
            </p>
            <Button
              large
              intent="primary"
              rightIcon="arrow-right"
              text="See the principles"
              onClick={() =>
                document
                  .querySelector("#principles")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>

          <aside className="motivation-hero-thesis" aria-label="Our position">
            <span>OUR POSITION</span>
            <p>
              Most systems optimize for sameness. Kantzen optimizes for
              coherence: the kind that lets a site, a workspace, and a complex
              interaction belong to one product without becoming one template.
            </p>
            <div className="motivation-coordinate" aria-hidden="true">
              <BrandMark />
              <span>FORM</span>
              <i />
              <span>BEHAVIOR</span>
              <i />
              <span>VOICE</span>
            </div>
          </aside>

          <div className="motivation-hero-index" aria-hidden="true">
            <span>WHY KANTZEN</span>
            <span>01 / 04</span>
          </div>
        </section>

        <section className="motivation-principles" id="principles">
          <header>
            <span className="landing-section-label">THREE PRINCIPLES</span>
            <h2>What the system is here to protect.</h2>
          </header>

          <div className="motivation-principle-browser">
            <div className="motivation-principle-list" role="tablist">
              {principles.map((principle) => (
                <button
                  aria-controls={`principle-panel-${principle.id}`}
                  aria-selected={activePrinciple.id === principle.id}
                  className={
                    activePrinciple.id === principle.id
                      ? "is-active"
                      : undefined
                  }
                  key={principle.id}
                  onClick={() => setActivePrinciple(principle)}
                  role="tab"
                  type="button"
                >
                  <span>{principle.number}</span>
                  <strong>{principle.title}</strong>
                  <Icon icon="arrow-right" size={16} />
                </button>
              ))}
            </div>

            <div
              className="motivation-principle-panel"
              id={`principle-panel-${activePrinciple.id}`}
              role="tabpanel"
            >
              <span>{activePrinciple.number} / PRINCIPLE</span>
              <h3>{activePrinciple.summary}</h3>
              <p>{activePrinciple.detail}</p>
              <div className="motivation-principle-progress" aria-hidden="true">
                {principles.map((principle) => (
                  <i
                    className={
                      principle.id === activePrinciple.id
                        ? "is-active"
                        : undefined
                    }
                    key={principle.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="motivation-detail-section">
          <div className="motivation-detail-intro">
            <span className="landing-section-label">DETAIL IS THE PRODUCT</span>
            <h2>
              Philosophy only matters when it survives contact with the
              interface.
            </h2>
            <p>
              That is why the system includes the overlooked middle: keyboard
              paths, responsive shells, high-density views, focus behavior, and
              states that explain what just happened.
            </p>
          </div>
          <CommandWorkbench onNavigate={onNavigate} />
        </section>

        <section className="motivation-commitments">
          <header>
            <span className="landing-section-label">THE STANDARD</span>
            <h2>Four commitments, visible in every surface.</h2>
          </header>
          <div className="motivation-commitment-list">
            {commitments.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="motivation-cta">
          <div>
            <span>THE RESULT</span>
            <h2>Build less sameness.</h2>
          </div>
          <p>
            Start from a system that already understands the distance between
            “it works” and “it belongs.”
          </p>
          <Button
            large
            rightIcon="arrow-right"
            text="Explore components"
            onClick={() => onNavigate("/components")}
          />
        </section>
      </main>
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
}
