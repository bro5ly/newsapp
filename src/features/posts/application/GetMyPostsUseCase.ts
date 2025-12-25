// features/post/usecase/GetMyPostsUseCase.ts
import { PostRepository } from "../domain/PostRepository";

export class GetMyPostsUseCase {
    constructor(private postRepo: PostRepository) { }

    async execute(userId: string) {
        // 自分の投稿なので、リポジトリ側で privacy_scope を問わず取得するメソッドを呼び出す
        return await this.postRepo.findByUserId(userId);
    }
}