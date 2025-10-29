import HttpError from './HttpError.js';

export default class ValidationError extends HttpError {
  constructor(issues) {
    const normalizedIssues = Array.isArray(issues) ? issues : [];
    super({
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      data: normalizedIssues,
    });
    this.name = 'ValidationError';
    this.issues = normalizedIssues;
  }
}
