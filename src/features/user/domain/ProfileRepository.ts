// features/user/domain/ProfileRepository.ts

import { Profile } from "./Profile";

export interface ProfileRepository {
    /**
     * ユーザーIDに基づいてプロフィールを取得する
     */
    findById(userId: string): Promise<Profile | null>;

    /**
     * プロフィール情報を保存または更新する
     */
    save(profile: Profile): Promise<void>;
}