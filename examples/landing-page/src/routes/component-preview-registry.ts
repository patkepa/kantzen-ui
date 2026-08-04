import { reusableComponentDemos } from "./component-preview-components";
import { primitiveComponentDemos } from "./component-preview-primitives";
import { shellComponentDemos } from "./component-preview-shells";
import { siteComponentDemos } from "./component-preview-site";
import type { ComponentDemoRegistry } from "./component-preview-types";

export const componentPreviewRegistry: ComponentDemoRegistry = {
  ...primitiveComponentDemos,
  ...reusableComponentDemos,
  ...siteComponentDemos,
  ...shellComponentDemos,
};
