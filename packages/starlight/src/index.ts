import type { StarlightExpressiveCodeOptions } from "@astrojs/starlight/expressive-code";
import type { StarlightPlugin } from "@astrojs/starlight/types";

const stylesheet = "@patkepa/kantzen-starlight/styles.css";

export interface KantzenStarlightOptions {
  /** Apply Kantzen's Expressive Code colors and layout defaults. */
  expressiveCode?: boolean;
}

export const kantzenExpressiveCode = {
  themes: ["github-dark"],
  useStarlightUiThemeColors: false,
  minSyntaxHighlightingColorContrast: 7,
  customizeTheme(theme) {
    theme.colors["editor.background"] = "#1e2430";
    theme.colors["editor.foreground"] = "#eef2f7";
    theme.colors["terminal.background"] = "#1e2430";
  },
  styleOverrides: {
    borderColor: "#414d61",
    codeFontSize: "0.875rem",
    codeLineHeight: "1.7",
  },
} satisfies StarlightExpressiveCodeOptions;

function mergeExpressiveCode(
  configured: StarlightExpressiveCodeOptions | boolean | undefined,
): StarlightExpressiveCodeOptions {
  if (!configured || typeof configured === "boolean") {
    return kantzenExpressiveCode;
  }

  return {
    ...kantzenExpressiveCode,
    ...configured,
    styleOverrides: {
      ...kantzenExpressiveCode.styleOverrides,
      ...configured.styleOverrides,
    },
  };
}

export function kantzenStarlight(
  options: KantzenStarlightOptions = {},
): StarlightPlugin {
  return {
    name: "@patkepa/kantzen-starlight",
    hooks: {
      "config:setup"({ config, updateConfig }) {
        const customCss = config.customCss?.includes(stylesheet)
          ? config.customCss
          : [...(config.customCss ?? []), stylesheet];

        if (
          options.expressiveCode === false ||
          config.expressiveCode === false
        ) {
          updateConfig({ customCss });
          return;
        }

        updateConfig({
          customCss,
          expressiveCode: mergeExpressiveCode(config.expressiveCode),
        });
      },
    },
  };
}

export default kantzenStarlight;
