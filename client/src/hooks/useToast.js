/**
 * useToast — Convenience wrapper around react-hot-toast
 * Provides consistent toast styling and helpers
 */
import toast from 'react-hot-toast';

export const useToast = () => {
  return {
    success: (msg, opts) => toast.success(msg, opts),
    error: (msg, opts) => toast.error(msg, opts),
    loading: (msg, opts) => toast.loading(msg, opts),
    dismiss: (id) => toast.dismiss(id),
    promise: (promise, msgs, opts) => toast.promise(promise, msgs, opts),
    info: (msg, opts) =>
      toast(msg, {
        icon: 'ℹ️',
        ...opts,
      }),
    warn: (msg, opts) =>
      toast(msg, {
        icon: '⚠️',
        style: { background: '#f59e0b', color: '#fff' },
        ...opts,
      }),
  };
};
