// features/friendship/infrastructure/SupabaseFriendshipRepository.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { Friendship, FriendshipStatus } from '../domain/friendhip'
import { FriendshipRepository } from '../domain/FriendshipRepository';

export class SupabaseFriendshipRepository implements FriendshipRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Friendship | null> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return new Friendship(
      data.id,
      data.user_id,
      data.friend_id,
      data.status as FriendshipStatus,
      new Date(data.created_at)
    );
  }

  async findBetween(userId: string, friendId: string): Promise<Friendship | null> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .maybeSingle();

    if (error || !data) return null;

    return new Friendship(
      data.id,
      data.user_id,
      data.friend_id,
      data.status as FriendshipStatus,
      new Date(data.created_at)
    );
  }

  async save(friendship: Friendship): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .upsert({
        id: friendship.id,
        user_id: friendship.userId,
        friend_id: friendship.friendId,
        status: friendship.status,
      });

    if (error) throw new Error(`Failed to save friendship: ${error.message}`);
  }

  async findAllFriends(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'ACCEPTED')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error || !data) return [];

    // 自分以外のIDを抽出
    return data.map((f: any) => f.user_id === userId ? f.friend_id : f.user_id);
  }

  // SupabaseFriendshipRepository.ts 内に追加
  async findPendingRequests(userId: string): Promise<Friendship[]> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', userId) // 自分宛て
      .eq('status', 'PENDING');

    if (error || !data) return [];
    return data.map(d => new Friendship(d.id, d.user_id, d.friend_id, d.status, new Date(d.created_at)));
  }
}