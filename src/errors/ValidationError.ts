import { HttpError } from "routing-controllers";

export class ValidationError extends HttpError {

  errors: any;

  constructor(errors: any) {
    super(422);
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }

  toJSON() {
    const result = this.errors.reduce((object: any, error: any) => {
      return {
        ...object,
        [error.property]: error.constraints,
      };
    }, {});

    return result;
  }
}
