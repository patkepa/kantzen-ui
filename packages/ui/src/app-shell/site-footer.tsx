import type { MouseEvent, ReactNode } from "react";
import type { SiteNavGroup, SiteNavItem } from "../navigation.js";

export interface SiteFooterProps {
  productName: string;
  groups?: SiteNavGroup[];
  secondaryLinks?: SiteNavItem[];
  children?: ReactNode;
  className?: string;
  onNavigate?: (href: string) => void;
}

export const SiteFooter = ({
  productName,
  groups = [],
  secondaryLinks = [],
  children,
  className,
  onNavigate,
}: SiteFooterProps) => {
  const classNames = ["site-footer", className].filter(Boolean).join(" ");
  const handleNavigate =
    (href: string, external?: boolean) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (external || !onNavigate) return;
      event.preventDefault();
      onNavigate(href);
    };

  return (
    <footer className={classNames}>
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-product">{productName}</div>
          {children && <div className="site-footer-content">{children}</div>}
        </div>

        {groups.length > 0 && (
          <nav className="site-footer-groups" aria-label="Footer navigation">
            {groups.map((group) => (
              <div className="site-footer-group" key={group.label}>
                <div className="site-footer-group-label">{group.label}</div>
                <div className="site-footer-group-links">
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      onClick={handleNavigate(item.href, item.external)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}

        {secondaryLinks.length > 0 && (
          <div className="site-footer-secondary">
            {secondaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                onClick={handleNavigate(link.href, link.external)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};
