// features/post/usecase/GetTimelineUseCase.ts
import { PostRepository } from "../domain/PostRepository";
import { FriendshipRepository } from "../../friendship/domain/FriendshipRepository";

export class GetTimelineUseCase {
    constructor(
        private postRepo: PostRepository,
        private friendshipRepo: FriendshipRepository
    ) { }

    async execute(userId: string) {
        // 1. 友達のIDリストを取得（ACCEPTEDな関係のみ）
        const friendIds = await this.friendshipRepo.findAllFriends(userId);

        // 2. 自分と友達のIDを合わせたリストを作成
        const targetUserIds = [userId, ...friendIds];

        // 3. タイムライン用の投稿を取得（自分の全投稿 + 友達の公開/限定投稿）
        return await this.postRepo.findTimelinePosts(targetUserIds, userId);
    }
}