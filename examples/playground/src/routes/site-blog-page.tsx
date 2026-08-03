import { SiteFooter, SiteShell } from "@kantzen-ui/app-shell";
import { SiteGrid, SiteHero, SiteSection } from "@kantzen-ui/ui";
import { articleCards } from "../fixtures/site-content";
import { footerGroups, siteActions, siteNavItems } from "../fixtures/site-nav";

interface SiteRouteProps {
  currentPath: string;
  onNavigate: (href: string) => void;
}

export const SiteBlogPage = ({ currentPath, onNavigate }: SiteRouteProps) => (
  <SiteShell
    productName="Kantzen"
    navItems={siteNavItems}
    actions={siteActions}
    currentPath={currentPath}
    onNavigate={onNavigate}
    footer={<SiteFooter productName="Kantzen" groups={footerGroups} />}
  >
    <SiteHero
      eyebrow="Blog layout"
      title="Writing surfaces that share the product system"
      description="This route verifies public content density, card rhythm, and long-form page spacing without workspace chrome."
    />
    <SiteSection
      title="Latest writing"
      description="Cards use site primitives and local playground fixtures."
    >
      <SiteGrid minColumnWidth="280px">
        {articleCards.map((article) => (
          <article className="playground-article-card" key={article.title}>
            <span className="mono-data">{article.meta}</span>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </article>
        ))}
      </SiteGrid>
    </SiteSection>
  </SiteShell>
);
