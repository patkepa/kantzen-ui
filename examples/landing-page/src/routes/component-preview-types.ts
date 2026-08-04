import type { ComponentType } from "react";

export interface ComponentDemoProps {
  onFeedback: (message: string) => void;
}

export type ComponentDemoRegistry = Readonly<
  Record<string, ComponentType<ComponentDemoProps>>
>;
