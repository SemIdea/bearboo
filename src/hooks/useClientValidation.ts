import { useState } from "react";
import { getErrorMessage } from "@/lib/error";
import {
  ValidationErrorCode,
  ValidationErrorMessages
} from "@/shared/error/validation";

type ValidationRule = {
  condition: boolean;
  errorCode: ValidationErrorCode;
};

export const useClientValidation = () => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateField = (rules: ValidationRule[]): boolean => {
    for (const rule of rules) {
      if (rule.condition) {
        const errorMessage = getErrorMessage(rule.errorCode);
        setValidationError(errorMessage);
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  // Specific validation functions for common use cases
  const validatePostData = (title: string, content: string): boolean => {
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

  const validateCommentData = (content: string): boolean => {
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

  const validateUserData = (
    name?: string,
    email?: string,
    password?: string
  ): boolean => {
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

  return {
    validationError,
    setValidationError,
    clearValidationError,
    validateField,
    validatePostData,
    validateCommentData,
    validateUserData
  };
};
