/**
 * ErrorBoundary — catches React render errors
 */
import { Component } from 'react';
import ErrorPage from '@pages/errors/ErrorPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          title="Something went wrong"
          message="An unexpected error occurred. Try refreshing or return to the dashboard."
          onPrimary={this.handleReset}
          primaryLabel="Go to Dashboard"
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
