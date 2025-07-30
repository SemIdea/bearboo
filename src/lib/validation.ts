import { useState } from "react";
import {
  validatePostData,
  validateCommentData,
  validateUserData
} from "@/utils/validation";

export const useClientValidation = () => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearValidationError = () => {
    setValidationError(null);
  };

  // React hook wrappers for the pure validation functions
  const validatePost = (title: string, content: string): boolean => {
    const result = validatePostData(title, content);
    setValidationError(result.errorMessage);
    return result.isValid;
  };

  const validateComment = (content: string): boolean => {
    const result = validateCommentData(content);
    setValidationError(result.errorMessage);
    return result.isValid;
  };

  const validateUser = (
    name?: string,
    email?: string,
    password?: string
  ): boolean => {
    const result = validateUserData(name, email, password);
    setValidationError(result.errorMessage);
    return result.isValid;
  };

  return {
    validationError,
    setValidationError,
    clearValidationError,
    validatePost,
    validateComment,
    validateUser
  };
};
