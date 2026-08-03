import { Component, Fragment } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "../primitives/button.js";
import { NonIdealState } from "../primitives/layout.js";

export type ErrorBoundaryContent = ReactNode | ((error: Error) => ReactNode);

export interface ErrorBoundaryProps {
  action?: "reload" | "reset";
  actionLabel?: string;
  children: ReactNode;
  className?: string;
  description?: ErrorBoundaryContent;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: ErrorBoundaryContent;
}

interface State {
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(reason: unknown): Partial<State> {
    return {
      error: reason instanceof Error ? reason : new Error(String(reason)),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    const { error } = this.state;
    if (error) {
      const {
        action = "reset",
        actionLabel = action === "reload" ? "Reload" : "Try Again",
        className,
        description = "An unexpected error occurred in this section.",
        title = "Something went wrong",
      } = this.props;
      const resolveContent = (content: ErrorBoundaryContent) =>
        typeof content === "function" ? content(error) : content;

      return (
        <NonIdealState
          className={className}
          icon="error"
          role="alert"
          title={resolveContent(title)}
          description={resolveContent(description)}
          action={
            <Button
              intent="primary"
              icon="refresh"
              onClick={() => {
                if (action === "reload") {
                  window.location.reload();
                  return;
                }
                this.setState((state) => ({
                  error: null,
                  resetKey: state.resetKey + 1,
                }));
              }}
            >
              {actionLabel}
            </Button>
          }
        />
      );
    }
    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
