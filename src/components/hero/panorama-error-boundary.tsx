"use client";

import { Component, type ReactNode } from "react";

type PanoramaErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type PanoramaErrorBoundaryState = {
  failed: boolean;
};

export class PanoramaErrorBoundary extends Component<
  PanoramaErrorBoundaryProps,
  PanoramaErrorBoundaryState
> {
  state: PanoramaErrorBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
