// features/auth/infrastructure/AuthRepository.ts
import { AuthUser } from "./AuthTypes";

export interface AuthRepository {
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithGoogle(): Promise<{ url: string }>;
  exchangeCodeForSession(code: string): Promise<void>;
}