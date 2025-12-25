// features/user/infrastructure/SupabaseUserRepository.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../domain/UserRepository';
import { Account, AccountStatus } from '../domain/Account';

// features/user/infrastructure/SupabaseUserRepository.ts

export class SupabaseUserRepository implements UserRepository {
  constructor(private supabase: SupabaseClient) { }

  async findById(id: string): Promise<Account | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('id, display_name, status, email') // emailも一緒に取る
      .eq('id', id)
      .single();

    if (error || !profile) return null;

    return new Account(
      profile.id,
      profile.display_name ?? '',
      profile.status as AccountStatus,
      profile.email // 直接DBから取得
    );
  }

  // features/user/infrastructure/SupabaseUserRepository.ts

  // features/user/infrastructure/SupabaseUserRepository.ts

  async searchByName(nameQuery: string, currentUserId: string): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', `%${nameQuery}%`) // 部分一致検索
      .neq('id', currentUserId)               // 自分自身は除外
      .limit(10);                             // 10件に制限

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data.map(d => new Account(
      d.id,
      d.display_name,
      d.status,
      d.email
      // emailは取得していない、あるいは共通定義に合わせてマッピング
    ));
  }

  async save(account: Account): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .upsert({
        id: account.id,
        display_name: account.name,
        status: account.status,
        email: account.email, // emailも保存対象に含める
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error(`Failed to save account: ${error.message}`);
  }
}