import { ICommentRepository } from '../domain/CommentRepository';

export class GetCommentsUsecase {
    constructor(private repository: ICommentRepository) { }

    async execute(postId: string) {
        return await this.repository.findByPostId(postId);
    }
}