// features/post/application/ToggleLikeUseCase.ts
import { PostInteractionRepository } from "../domain/PostInteractionRepository";
import { Like } from "../domain/Like";

export class ToggleLikeUseCase {
    constructor(private interactionRepo: PostInteractionRepository) { }

    async execute(postId: string, userId: string): Promise<{ isLiked: boolean; count: number }> {
        // 1. すでにいいねしているか確認
        const alreadyLiked = await this.interactionRepo.isLikedByUser(postId, userId);

        if (alreadyLiked) {
            // 2. すでにあれば削除（解除）
            await this.interactionRepo.deleteLike(postId, userId);
        } else {
            // 3. なければ新規作成（いいね）
            const like = new Like(postId, userId, new Date());
            await this.interactionRepo.saveLike(like);
        }

        // 4. 最新のいいね数と状態を返す
        const count = await this.interactionRepo.getLikeCount(postId);
        return {
            isLiked: !alreadyLiked,
            count
        };
    }
}