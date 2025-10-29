const createValidationError = (message, code) => {
  const error = new Error(message);
  error.code = code || 'VALIDATION_ERROR';
  return error;
};

export const string =
  ({ minLength, maxLength, pattern, trim = true } = {}) =>
    (value, path) => {
      if (typeof value !== 'string') {
        throw createValidationError(
          `${path} must be a string`,
          'VALIDATION_STRING'
        );
      }

      let output = trim ? value.trim() : value;

      if (minLength !== undefined && output.length < minLength) {
        throw createValidationError(
          `${path} must be at least ${minLength} characters long`,
          'VALIDATION_STRING_MIN'
        );
      }

      if (maxLength !== undefined && output.length > maxLength) {
        throw createValidationError(
          `${path} must be at most ${maxLength} characters long`,
          'VALIDATION_STRING_MAX'
        );
      }

      if (pattern && !pattern.test(output)) {
        throw createValidationError(
          `${path} is not in a valid format`,
          'VALIDATION_STRING_PATTERN'
        );
      }

      return output;
    };

export const number =
  ({ min, max, integer = false } = {}) =>
    (value, path) => {
      const parsed = typeof value === 'number' ? value : Number(value);

      if (!Number.isFinite(parsed)) {
        throw createValidationError(
          `${path} must be a number`,
          'VALIDATION_NUMBER'
        );
      }

      if (integer && !Number.isInteger(parsed)) {
        throw createValidationError(
          `${path} must be an integer`,
          'VALIDATION_NUMBER_INTEGER'
        );
      }

      if (min !== undefined && parsed < min) {
        throw createValidationError(
          `${path} must be greater than or equal to ${min}`,
          'VALIDATION_NUMBER_MIN'
        );
      }

      if (max !== undefined && parsed > max) {
        throw createValidationError(
          `${path} must be less than or equal to ${max}`,
          'VALIDATION_NUMBER_MAX'
        );
      }

      return parsed;
    };

export const boolean = () => (value, path) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;

  throw createValidationError(
    `${path} must be a boolean`,
    'VALIDATION_BOOLEAN'
  );
};

export const isoDateString = () => (value, path) => {
  if (typeof value !== 'string') {
    throw createValidationError(
      `${path} must be a date string`,
      'VALIDATION_DATE'
    );
  }

  const trimmed = value.trim();
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw createValidationError(
      `${path} must be a valid ISO date`,
      'VALIDATION_DATE'
    );
  }

  return trimmed;
};

export const url = () => (value, path) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createValidationError(`${path} must be a URL`, 'VALIDATION_URL');
  }

  try {
    const trimmed = value.trim();
    return new URL(trimmed).toString();
  } catch (_error) {
    throw createValidationError(
      `${path} must be a valid URL`,
      'VALIDATION_URL'
    );
  }
};

export const enumeration = (values) => (value, path) => {
  if (!values.includes(value)) {
    throw createValidationError(
      `${path} must be one of: ${values.join(', ')}`,
      'VALIDATION_ENUM'
    );
  }

  return value;
};
