import { DomainException } from "../../core/exceptions/domain-exception";

export class ConferenceTooLongException extends DomainException {
  constructor() {
    super("The conference is too long (>3h)")
  }
}