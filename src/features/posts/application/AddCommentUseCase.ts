// features/post/application/AddCommentUseCase.ts
import { PostInteractionRepository } from "../domain/PostInteractionRepository";
import { Comment } from "../domain/Comment";

export class AddCommentUseCase {
    constructor(private interactionRepo: PostInteractionRepository) { }

    async execute(postId: string, userId: string, content: string): Promise<Comment> {
        if (!content.trim()) {
            throw new Error("コメント内容が空です");
        }

        const comment = new Comment(
            crypto.randomUUID(),
            postId,
            userId,
            content,
            new Date()
        );

        await this.interactionRepo.saveComment(comment);

        // 保存後、表示に必要なプロフィール情報を含めた最新のコメント一覧を取得するために
        // ここでは一旦エンティティを返しますが、フロントでは再取得するのが一般的です
        return comment;
    }
}