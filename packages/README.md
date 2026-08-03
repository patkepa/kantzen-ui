# Package

Kantzen UI exposes one public npm package with feature-oriented subpaths:

| Export path                      | Purpose                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@kantzen-ui/ui`                 | Theme, icons, primitives, interactions, navigation contracts, and reusable workspace/site components. |
| `@kantzen-ui/ui/app-shell`       | Workspace and public-site chrome built around React Router.                                           |
| `@kantzen-ui/ui/command-palette` | Command palette frame and keyboard handling built around `cmdk`.                                      |
| `@kantzen-ui/ui/graph`           | Data-agnostic force graph canvas, renderer, and simulation utilities.                                 |

The package builds typed ESM into its ignored `dist` directory. The repository
root and playground workspaces are private and cannot be published accidentally.

## Basic usage

```tsx
import { BrowserRouter } from "react-router-dom";
import { WorkspaceShell } from "@kantzen-ui/ui/app-shell";
import { ThemeProvider } from "@kantzen-ui/ui";
import type { NavGroup } from "@kantzen-ui/ui/navigation";

import "@kantzen-ui/ui/styles.css";
import "@kantzen-ui/ui/app-shell/styles.css";

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
