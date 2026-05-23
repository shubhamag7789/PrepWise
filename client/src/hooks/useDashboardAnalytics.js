/**
 * useDashboardAnalytics — fetch compact analytics for dashboard widgets
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardAnalytics } from '@api/analyticsApi';
import { unwrapApi } from '@utils/apiHelpers';

export const useDashboardAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasDataRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      if (!hasDataRef.current) setLoading(true);
      setError(null);
      const res = await getDashboardAnalytics();
      const payload = unwrapApi(res);
      setData(payload);
      hasDataRef.current = !!payload;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

export default useDashboardAnalytics;
