/**
 * Card — Versatile surface card component
 */
import { clsx } from 'clsx';

const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border transition-all duration-200',
        'bg-[var(--color-bg-card)] border-[var(--color-border)]',
        glass && 'glass-card',
        hover && 'hover:-translate-y-1 hover:shadow-card dark:hover:shadow-card-dark cursor-pointer',
        paddings[padding] || paddings.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={clsx('mb-4 pb-4 border-b border-[var(--color-border)]', className)}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={clsx('flex-1', className)}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={clsx('mt-4 pt-4 border-t border-[var(--color-border)]', className)}>
    {children}
  </div>
);

export default Card;
