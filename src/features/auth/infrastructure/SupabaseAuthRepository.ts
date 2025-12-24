// features/auth/infrastructure/SupabaseAuthRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthRepository } from './AuthRepository';
import { AuthUser } from './AuthTypes';

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email ?? '' };
  }

  async signInWithGoogle(): Promise<{ url: string }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback` }
    });
    if (error) throw error;
    return { url: data.url };
  }

  async exchangeCodeForSession(code: string): Promise<void> {
    const { error } = await this.supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  }
}