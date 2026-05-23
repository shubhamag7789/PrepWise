import ErrorPage from './ErrorPage';

const NotFound = () => (
  <ErrorPage
    code="404"
    title="Page not found"
    message="This page doesn't exist. Check the URL or use search (⌘K) from the dashboard."
    primaryTo="/dashboard"
  />
);

export default NotFound;
