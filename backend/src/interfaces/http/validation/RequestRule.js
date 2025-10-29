const createError = (message, code = 'VALIDATION_ERROR', details) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
};

export default class RequestRule {
  constructor(validator, { required = false, defaultValue, transform } = {}) {
    this.validator = validator;
    this.required = required;
    this.defaultValue = defaultValue;
    this.transform = transform;
  }

  validate(value, path) {
    const hasValue = !(value === undefined || value === null || value === '');

    if (!hasValue) {
      if (this.required) {
        throw createError(`${path} is required`, 'VALIDATION_REQUIRED');
      }
      return this.defaultValue;
    }

    let processedValue =
      typeof this.validator === 'function'
        ? this.validator(value, path)
        : value;

    if (this.transform) {
      processedValue = this.transform(processedValue);
    }

    return processedValue;
  }
}
