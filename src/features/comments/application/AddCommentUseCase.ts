import { ICommentRepository } from '../domain/CommentRepository';
import { createComment } from '../domain/Comment';

export class AddCommentUsecase {
    constructor(private repository: ICommentRepository) { }

    async execute(postId: string, userId: string, content: string) {
        // ドメインルールを適用してデータを作成
        const newComment = createComment({
            content,
            post_id: postId,
            user_id: userId
        });

        return await this.repository.save(newComment);
    }
}