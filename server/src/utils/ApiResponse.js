/**
 * Standardized API Response Wrapper
 * Ensures all API responses follow a consistent JSON structure
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*}      data - Response payload
   * @param {string} message - Human-readable success message
   */
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  // ── Factory helpers ───────────────────────────────────────────────────────

  static ok(res, data = null, message = 'Success') {
    return res.status(200).json(new ApiResponse(200, data, message));
  }

  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
