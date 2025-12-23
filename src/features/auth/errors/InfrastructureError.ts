import { DomainError } from "@/packages/domain/errors/DomainError";
/** インフラ（Supabase等）の通信障害 */
export class InfrastructureError extends DomainError {
  constructor(message: string) {
    super(message, 'AUTH_INFRA_ERROR');
  }
}