/**
 * Unwrap PrepWise API envelope: { success, data, message, ... }
 */
export const unwrapApi = (payload) => {
  if (payload == null || typeof payload !== 'object') return payload;
  if ('data' in payload && ('success' in payload || 'statusCode' in payload)) {
    return payload.data;
  }
  return payload;
};
