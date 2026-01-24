import { ICommentRepository } from '../domain/CommentRepository';

export class DeleteCommentUsecase {
    constructor(private repository: ICommentRepository) { }

    async execute(commentId: string, userId: string) {
        // 自分のコメントのみ削除可能（Repository側で制御）
        await this.repository.delete(commentId, userId);
    }
}