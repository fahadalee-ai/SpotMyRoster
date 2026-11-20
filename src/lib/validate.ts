export type Issue = "required" | "email" | "password" | "match" | "phone" | "otp" | "short";

export function isBlank(value: string) {
  return value.trim().length === 0;
}

export function emailIssue(value: string): Issue | null {
  if (isBlank(value)) return "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "email";
  return null;
}

export function passwordIssue(value: string): Issue | null {
  if (isBlank(value)) return "required";
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) return "password";
  return null;
}

export function phoneIssue(value: string): Issue | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "required";
  if (digits.length < 10 || digits.length > 11) return "phone";
  return null;
}

export function requiredIssue(value: string): Issue | null {
  return isBlank(value) ? "required" : null;
}
