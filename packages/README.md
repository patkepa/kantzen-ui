# Package

Kantzen UI exposes one public npm package with feature-oriented subpaths:

| Export path                           | Purpose                                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@patkepa/kantzen-ui`                 | Theme, icons, primitives, interactions, navigation contracts, and reusable workspace/site components. |
| `@patkepa/kantzen-ui/app-shell`       | Router-agnostic workspace and public-site chrome.                                                     |
| `@patkepa/kantzen-ui/command-palette` | Command palette frame and keyboard handling built around `cmdk`.                                      |
| `@patkepa/kantzen-ui/graph`           | Data-agnostic force graph canvas, renderer, and simulation utilities.                                 |

The package builds typed ESM into its ignored `dist` directory. The repository
root and playground workspaces are private and cannot be published accidentally.

## Basic usage

```tsx
import { WorkspaceShell } from "@patkepa/kantzen-ui/app-shell";
import { ThemeProvider } from "@patkepa/kantzen-ui";
import type { NavGroup } from "@patkepa/kantzen-ui/navigation";

import "@patkepa/kantzen-ui/styles.css";
import "@patkepa/kantzen-ui/app-shell/styles.css";

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [{ label: "Overview", icon: "dashboard", href: "/" }],
  },
];

export function App() {
  return (
    <ThemeProvider>
      <WorkspaceShell
        currentPath="/"
        productName="Internal Tool"
        navGroups={navGroups}
        sidebarCollapsed={false}
        onNavigate={(href) => console.log(href)}
        onToggleSidebar={() => undefined}
      >
        {/* app routes */}
      </WorkspaceShell>
    </ThemeProvider>
  );
}
```

Blueprint Core is not required. `@blueprintjs/icons` is an implementation
dependency of `@patkepa/kantzen-ui`.
