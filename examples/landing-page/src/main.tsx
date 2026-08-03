import "@kantzen-ui/ui/styles.css";
import "@kantzen-ui/ui/app-shell/styles.css";
import "@kantzen-ui/ui/graph/styles.css";
import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@kantzen-ui/ui";
import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
