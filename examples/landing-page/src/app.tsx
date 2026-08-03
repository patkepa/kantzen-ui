import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ComponentGallery } from "./routes/component-gallery";
import { ExamplesPage } from "./routes/examples-page";
import {
  LandingHeader,
  LandingPage,
  type LandingPageProps,
} from "./routes/landing-page";
import { MotivationPage } from "./routes/motivation-page";
import { SiteBlogPage } from "./routes/site-blog-page";
import { SiteProductPage } from "./routes/site-product-page";
import { StressPage } from "./routes/stress";
import { WorkspaceDemo } from "./routes/workspace-demo";

const playgroundRoutes = [
  { label: "Examples", href: "/examples" },
  { label: "Landing page", href: "/" },
  { label: "Motivation", href: "/motivation" },
  { label: "Product", href: "/site/product" },
  { label: "Workspace", href: "/workspace" },
  { label: "Blog", href: "/site/blog" },
  { label: "Components", href: "/components" },
  { label: "Stress", href: "/stress" },
];

const PlaygroundSwitcher = () => (
  <nav className="playground-switcher" aria-label="Playground demos">
    {playgroundRoutes.map((route) => (
      <NavLink key={route.href} to={route.href}>
        {route.label}
      </NavLink>
    ))}
  </nav>
);

const WorkspaceExamplePage = ({ onNavigate }: LandingPageProps) => (
  <div className="landing-page workspace-example-page">
    <LandingHeader activeItem="examples" onNavigate={onNavigate} />
    <WorkspaceDemo />
  </div>
);

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={navigate} />} />
        <Route
          path="/examples"
          element={<ExamplesPage onNavigate={navigate} />}
        />
        <Route
          path="/motivation"
          element={<MotivationPage onNavigate={navigate} />}
        />
        <Route
          path="/site/product"
          element={
            <SiteProductPage
              currentPath={location.pathname}
              onNavigate={navigate}
            />
          }
        />
        <Route
          path="/site/blog"
          element={
            <SiteBlogPage
              currentPath={location.pathname}
              onNavigate={navigate}
            />
          }
        />
        <Route
          path="/components"
          element={
            <ComponentGallery
              currentPath={location.pathname}
              onNavigate={navigate}
            />
          }
        />
        <Route
          path="/stress"
          element={
            <StressPage currentPath={location.pathname} onNavigate={navigate} />
          }
        />
        <Route
          path="/workspace/*"
          element={<WorkspaceExamplePage onNavigate={navigate} />}
        />
      </Routes>
      {location.pathname === "/" ||
      location.pathname === "/examples" ||
      location.pathname === "/components" ||
      location.pathname === "/motivation" ? null : (
        <PlaygroundSwitcher />
      )}
    </>
  );
};
