import { DomainError } from "@/packages/domain/errors/DomainError";
/** アカウントロック状態 */
export class AccountLockedError extends DomainError {
  constructor(message: string = "アカウントがロックされています") {
    super(message, 'AUTH_LOCKED');
  }
}