// features/user/infrastructure/SupabaseProfileRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '../domain/Profile';
import { ProfileRepository } from '../domain/ProfileRepository';

export class SupabaseProfileRepository implements ProfileRepository {
    constructor(private supabase: SupabaseClient) { }

    async findById(userId: string): Promise<Profile | null> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data) return null;

        return new Profile(
            data.id,
            data.display_name,
            data.avatar_url,
            new Date(data.updated_at)
        );
    }

    async save(profile: Profile): Promise<void> {
        const { error } = await this.supabase
            .from('profiles')
            .upsert({
                id: profile.id,
                display_name: profile.displayName,
                avatar_url: profile.avatarUrl,
                updated_at: profile.updatedAt.toISOString()
            });

        if (error) throw new Error(`Profile save failed: ${error.message}`);
    }
}