import { DomainError } from "@/packages/domain/errors/DomainError";

export class AuthenticationError extends DomainError {
  constructor(message: string = "認証に失敗しました") {
    super(message, 'AUTH_AUTHENTICATION_FAILED');
  }
}