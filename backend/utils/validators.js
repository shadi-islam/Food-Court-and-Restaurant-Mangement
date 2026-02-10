// Input validation utilities for security
import validator from 'validator';

/**
 * Sanitize and validate user input
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const sanitized = validator.trim(email);
  return validator.isEmail(sanitized);
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  // Basic phone validation: 10-15 digits
  const sanitized = validator.trim(phone.toString());
  return /^[\d\s\-\+\(\)]{10,15}$/.test(sanitized);
};

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const sanitized = validator.trim(name);
  // Name: 2-100 alphanumeric + spaces only
  return /^[a-zA-Z\s'-]{2,100}$/.test(sanitized) && sanitized.length >= 2;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // Password: minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return validator.trim(validator.escape(str)).substring(0, 500);
};

export const validateTableNumber = (tableNumber) => {
  const num = parseInt(tableNumber);
  return !isNaN(num) && num > 0 && num < 10000;
};

export const validateNumberOfPeople = (num) => {
  const n = parseInt(num);
  return !isNaN(n) && n > 0 && n <= 500;
};

export const validateDate = (dateStr) => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date) && date > new Date();
};

export const validateUrl = (url) => {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};
