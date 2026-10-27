/**
 * Standard Form Validation Utilities for NeST Alumni Portal
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
export const DIGITS_ONLY_REGEX = /^\d+$/;

/**
 * Validates an email address against RFC-compliant format.
 */
export const validateEmail = (email?: string, required = true): string => {
  if (!email || !email.trim()) {
    return required ? 'Email address is required.' : '';
  }
  const clean = email.trim();
  if (!EMAIL_REGEX.test(clean)) {
    return 'Please enter a valid email address (e.g. user@nestgroup.net).';
  }
  return '';
};

/**
 * Validates full name or first/last name.
 */
export const validateName = (name?: string, label = 'Name', min = 2, max = 60, required = true): string => {
  if (!name || !name.trim()) {
    return required ? `${label} is required.` : '';
  }
  const clean = name.trim();
  if (clean.length < min) {
    return `${label} must be at least ${min} characters.`;
  }
  if (clean.length > max) {
    return `${label} cannot exceed ${max} characters.`;
  }
  // Disallow purely numeric or symbols
  if (!/^[a-zA-ZÀ-ÿ\s'.-]+$/.test(clean)) {
    return `${label} should contain valid letters without special symbols.`;
  }
  return '';
};

/**
 * Validates a phone number.
 */
export const validatePhone = (phone?: string, required = false): string => {
  if (!phone || !phone.trim()) {
    return required ? 'Phone number is required.' : '';
  }
  const clean = phone.trim();
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15 || !PHONE_REGEX.test(clean)) {
    return 'Please enter a valid phone number (e.g. +91 98765 43210 or 10 digits).';
  }
  return '';
};

/**
 * Validates a required text field.
 */
export const validateRequired = (value?: string, label = 'This field'): string => {
  if (!value || !value.trim()) {
    return `${label} is required.`;
  }
  return '';
};

/**
 * Validates string length boundaries.
 */
export const validateLength = (value?: string, min?: number, max?: number, label = 'This field'): string => {
  const clean = (value || '').trim();
  if (min && clean.length < min) {
    return `${label} must be at least ${min} characters.`;
  }
  if (max && clean.length > max) {
    return `${label} cannot exceed ${max} characters.`;
  }
  return '';
};

/**
 * Validates salary or stipend amounts.
 */
export const validateSalary = (val?: string): string => {
  if (!val || !val.trim()) return '';
  const clean = val.replace(/,/g, '').trim();
  const num = Number(clean);
  if (isNaN(num) || num < 0) {
    return 'Please enter a valid positive salary/stipend amount.';
  }
  return '';
};

/**
 * Validates date inputs supporting DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD.
 */
export const validateDate = (dateStr?: string, label = 'Date', required = false): string => {
  if (!dateStr || !dateStr.trim()) {
    return required ? `${label} is required.` : '';
  }
  const clean = dateStr.trim();

  // Check DD/MM/YYYY or DD-MM-YYYY format
  const ddmmyyyyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const match = clean.match(ddmmyyyyRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return `Please enter a valid ${label.toLowerCase()} in DD/MM/YYYY format.`;
    }
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return `Please enter a valid calendar date in DD/MM/YYYY format.`;
    }
    return '';
  }

  // Fallback ISO YYYY-MM-DD
  const parsed = new Date(clean);
  if (isNaN(parsed.getTime())) {
    return `Please enter a valid ${label.toLowerCase()} in DD/MM/YYYY format.`;
  }
  return '';
};

/**
 * Validates a 6-digit verification OTP code.
 */
export const validateOtp = (otp?: string): string => {
  if (!otp || !otp.trim()) {
    return 'Verification code is required.';
  }
  const clean = otp.trim();
  if (!/^\d{6}$/.test(clean)) {
    return 'Verification code must be exactly 6 numeric digits.';
  }
  return '';
};

/**
 * Validates password strength.
 */
export const validatePassword = (password?: string): string => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return '';
};

/**
 * Validates web URLs (LinkedIn, GitHub, Portfolio).
 */
export const validateUrl = (url?: string, label = 'URL', required = false): string => {
  if (!url || !url.trim()) {
    return required ? `${label} is required.` : '';
  }
  const clean = url.trim();
  if (!URL_REGEX.test(clean)) {
    return `Please enter a valid web link (e.g. https://...).`;
  }
  return '';
};
