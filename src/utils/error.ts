type IFieldConstructor = {
  field: string;
  reason: string;
};

class FieldError extends Error {
  field: string;
  reason: string;

  constructor({ field, reason }: IFieldConstructor) {
    super(`Invalid field ${field}: ${reason}`);
    this.field = field;
    this.reason = reason;
  }
}

export { FieldError };
