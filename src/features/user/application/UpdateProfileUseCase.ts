import { Profile } from "../domain/Profile";
import { ProfileRepository } from "../domain/ProfileRepository";

// features/user/application/UpdateProfileUseCase.ts
export class UpdateProfileUseCase {
    constructor(private profileRepo: ProfileRepository) { }

    async execute(userId: string, input: { displayName?: string; avatarUrl?: string; defaultVisibilityHours?: number }) {
        // 1. 現在のプロフィールを取得
        const existing = await this.profileRepo.findById(userId);

        // 2. 新しいデータでエンティティを再構成（バリデーションはProfileクラス内で行われる）
        const updatedProfile = new Profile(
            userId,
            input.displayName ?? existing?.displayName ?? null,
            input.avatarUrl ?? existing?.avatarUrl ?? null,
            new Date()
        );

        // 3. 保存
        await this.profileRepo.save(updatedProfile);
    }
}