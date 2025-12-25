import { Profile } from "../domain/Profile";
import { ProfileRepository } from "../domain/ProfileRepository";

// features/user/application/GetMyProfileUseCase.ts
export class GetMyProfileUseCase {
    constructor(private profileRepo: ProfileRepository) { }

    async execute(userId: string): Promise<Profile> {
        const profile = await this.profileRepo.findById(userId);

        // プロフィールが存在しない場合、初期値を返す（ドメインルール）
        if (!profile) {
            return new Profile(userId, "ゲストユーザー", null, new Date());
        }

        return profile;
    }
}