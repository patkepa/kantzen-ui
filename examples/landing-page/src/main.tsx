import "@patkepa/kantzen-ui/styles.css";
import "@patkepa/kantzen-ui/app-shell/styles.css";
import "@patkepa/kantzen-ui/command-palette/styles.css";
import "@patkepa/kantzen-ui/graph/styles.css";
import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@patkepa/kantzen-ui";
import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
