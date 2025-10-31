/**
 * Validation utilities for forms and data
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateSlug = (slug) => {
  const re = /^[a-z0-9-]+$/;
  return re.test(slug);
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.length <= maxLength;
};

export const validateNumericRange = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateFutureDate = (dateString) => {
  if (!validateDate(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

