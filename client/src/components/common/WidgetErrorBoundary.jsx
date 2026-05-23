/**
 * WidgetErrorBoundary — isolates chart/widget crashes so the rest of the page still renders
 */
import { Component } from 'react';

class WidgetErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(`WidgetErrorBoundary (${this.props.name}):`, error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {this.props.fallbackTitle || 'Could not load this widget'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Refresh the page to try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default WidgetErrorBoundary;
