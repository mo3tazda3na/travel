import ValidationError from '../errors/ValidationError.js';

const sections = ['params', 'query', 'body'];

export const validateRequest = (req, rules = {}) => {
  const result = {};
  const issues = [];

  sections.forEach((section) => {
    const ruleSet = rules[section];
    if (!ruleSet) return;

    const source = req[section] ?? {};
    const validatedSection = {};

    Object.entries(ruleSet).forEach(([key, rule]) => {
      try {
        const value = rule.validate(source[key], `${section}.${key}`);
        if (value !== undefined) {
          validatedSection[key] = value;
        }
      } catch (error) {
        issues.push({
          path: `${section}.${key}`,
          message: error.message,
          code: error.code || 'VALIDATION_ERROR',
        });
      }
    });

    result[section] = validatedSection;
  });

  if (issues.length) {
    throw new ValidationError(issues);
  }

  return result;
};

export default validateRequest;
