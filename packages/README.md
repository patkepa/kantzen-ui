# Packages

Kantzen UI exposes four public npm packages:

| Package                       | Purpose                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@kantzen-ui/ui`              | Theme, icons, primitives, interactions, navigation contracts, and reusable workspace/site components. |
| `@kantzen-ui/app-shell`       | Optional workspace and public-site chrome built around React Router.                                  |
| `@kantzen-ui/command-palette` | Optional command palette frame and keyboard handling built around `cmdk`.                             |
| `@kantzen-ui/graph`           | Optional data-agnostic force graph canvas, renderer, and simulation utilities.                        |

Each package builds typed ESM into its own ignored `dist` directory. The root
workspace is private and cannot be published accidentally.

## Basic usage

```tsx
import { BrowserRouter } from "react-router-dom";
import { WorkspaceShell } from "@kantzen-ui/app-shell";
import { ThemeProvider } from "@kantzen-ui/ui";
import type { NavGroup } from "@kantzen-ui/ui/navigation";

import "@kantzen-ui/ui/styles.css";
import "@kantzen-ui/app-shell/styles.css";

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [{ label: "Overview", icon: "dashboard", href: "/" }],
  },
];

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <WorkspaceShell
          productName="Internal Tool"
          navGroups={navGroups}
          sidebarCollapsed={false}
          onToggleSidebar={() => undefined}
        >
          {/* app routes */}
        </WorkspaceShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

Blueprint Core is not required. `@blueprintjs/icons` is an implementation
dependency of `@kantzen-ui/ui`.
