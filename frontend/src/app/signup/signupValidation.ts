export interface SignupFormData {
  fullName: string;
  workEmail: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  region: string;
  agreedToTerms: boolean;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const getPasswordStrength = (pass: string): PasswordStrength => {
  if (!pass) return { score: 0, label: "", color: "bg-transparent" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-400" };
  return { score: 4, label: "Strong", color: "bg-emerald-400" };
};

// Simplified email regex without polynomial backtracking (satisfies SonarQube S5852)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type FieldValidator = (val: string | boolean, currentPassword?: string, codeSent?: boolean) => string;

const validateFullName: FieldValidator = (val) => {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) return "Full name is required";
  if (str.length < 2) return "Name must be at least 2 characters";
  return "";
};

const validateWorkEmail: FieldValidator = (val) => {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) return "Work email is required";
  if (!EMAIL_REGEX.test(str)) {
    return "Enter a valid email address (e.g. name@company.com)";
  }
  return "";
};

const validatePassword: FieldValidator = (val) => {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) return "Password is required";
  if (str.length < 8) return "Password must be at least 8 characters";
  return "";
};

const validateConfirmPassword: FieldValidator = (val, currentPassword = "") => {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) return "Please confirm your password";
  if (str !== currentPassword) return "Passwords do not match";
  return "";
};

const validateVerificationCode: FieldValidator = (val, _currentPassword, codeSent = false) => {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) {
    return codeSent
      ? "Verification code is required"
      : "Please request a verification code sent to your email";
  }
  if (!/^\d{6}$/.test(str)) {
    return "Verification code must be 6 digits";
  }
  return "";
};

const validateAgreedToTerms: FieldValidator = (val) => {
  return !val ? "You must agree to continue" : "";
};

const FIELD_VALIDATORS: Partial<Record<keyof SignupFormData, FieldValidator>> = {
  fullName: validateFullName,
  workEmail: validateWorkEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  verificationCode: validateVerificationCode,
  agreedToTerms: validateAgreedToTerms,
};

export const validateField = (
  field: keyof SignupFormData,
  val: string | boolean,
  currentPassword = "",
  codeSent = false
): string => {
  const validator = FIELD_VALIDATORS[field];
  return validator ? validator(val, currentPassword, codeSent) : "";
};
