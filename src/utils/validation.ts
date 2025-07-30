import { getErrorMessage } from "@/lib/error";
import { ValidationErrorCode } from "@/shared/error/validation";

type ValidationRule = {
  condition: boolean;
  errorCode: ValidationErrorCode;
};

type ValidationResult = {
  isValid: boolean;
  errorMessage: string | null;
};

// Pure validation functions (no React dependencies)
export const validateField = (rules: ValidationRule[]): ValidationResult => {
  for (const rule of rules) {
    if (rule.condition) {
      const errorMessage = getErrorMessage(rule.errorCode);
      return { isValid: false, errorMessage };
    }
  }
  return { isValid: true, errorMessage: null };
};

export const validatePostData = (
  title: string,
  content: string
): ValidationResult => {
  return validateField([
    {
      condition: !title || !content,
      errorCode: ValidationErrorCode.POST_TITLE_AND_CONTENT_REQUIRED
    },
    {
      condition: title.length < 3,
      errorCode: ValidationErrorCode.POST_TITLE_TOO_SHORT_CLIENT
    },
    {
      condition: content.length < 10,
      errorCode: ValidationErrorCode.POST_CONTENT_TOO_SHORT_CLIENT
    }
  ]);
};

export const validateCommentData = (content: string): ValidationResult => {
  return validateField([
    {
      condition: !content,
      errorCode: ValidationErrorCode.COMMENT_CONTENT_REQUIRED_CLIENT
    },
    {
      condition: content.length < 1,
      errorCode: ValidationErrorCode.COMMENT_CONTENT_TOO_SHORT_CLIENT
    }
  ]);
};

export const validateUserData = (
  name?: string,
  email?: string,
  password?: string
): ValidationResult => {
  const rules: ValidationRule[] = [];

  if (name !== undefined) {
    rules.push({
      condition: name.length < 3,
      errorCode: ValidationErrorCode.USER_NAME_TOO_SHORT_CLIENT
    });
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    rules.push({
      condition: !emailRegex.test(email),
      errorCode: ValidationErrorCode.USER_EMAIL_INVALID_CLIENT
    });
  }

  if (password !== undefined) {
    rules.push({
      condition: password.length < 8,
      errorCode: ValidationErrorCode.USER_PASSWORD_TOO_SHORT_CLIENT
    });
  }

  return validateField(rules);
};
