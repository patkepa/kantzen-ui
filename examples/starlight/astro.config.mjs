import starlight from "@astrojs/starlight";
import kantzenStarlight from "@patkepa/kantzen-starlight";
import { defineConfig } from "astro/config";
import process from "node:process";

const base = process.env.BASE_PATH ?? "/";
const site = process.env.SITE_URL ?? "https://example.com";

export default defineConfig({
  base,
  site,
  integrations: [
    starlight({
      title: "Kantzen Docs",
      description: "Visual fixture for the Kantzen Starlight theme.",
      customCss: ["./src/styles.css"],
      logo: {
        src: "./src/assets/kantzen-mark.svg",
        alt: "Kantzen",
      },
      plugins: [kantzenStarlight()],
      sidebar: [
        {
          label: "Guide",
          items: [
            { label: "Overview", slug: "index" },
            { label: "Reference", slug: "reference" },
          ],
        },
      ],
    }),
  ],
});
