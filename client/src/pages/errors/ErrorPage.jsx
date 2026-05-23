/**
 * ErrorPage — reusable 404 / 500 / error UI
 */
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';

const ErrorPage = ({
  code = '404',
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or was moved.",
  primaryLabel = 'Back to Dashboard',
  primaryTo = '/dashboard',
  onPrimary,
  showHome = true,
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)] text-center">
    <p className="font-display font-black text-8xl sm:text-9xl gradient-text leading-none mb-4" aria-hidden="true">
      {code}
    </p>
    <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-text)] mb-3">
      {title}
    </h1>
    <p className="text-[var(--color-text-muted)] max-w-md mb-8 text-sm sm:text-base">{message}</p>
    <div className="flex flex-wrap gap-3 justify-center">
      {onPrimary ? (
        <Button onClick={onPrimary}>{primaryLabel}</Button>
      ) : (
        <Link to={primaryTo}>
          <Button>{primaryLabel}</Button>
        </Link>
      )}
      {showHome && (
        <Link to="/">
          <Button variant="outline">Home</Button>
        </Link>
      )}
    </div>
  </div>
);

export default ErrorPage;
