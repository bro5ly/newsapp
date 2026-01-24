// features/post/domain/PostInteractionRepository.ts
import { Comment } from "./Comment";
import { Like } from "./Like";

export interface PostInteractionRepository {
    // いいね
    saveLike(like: Like): Promise<void>;
    deleteLike(postId: string, userId: string): Promise<void>;
    getLikeCount(postId: string): Promise<number>;
    isLikedByUser(postId: string, userId: string): Promise<boolean>;

    // コメント
    saveComment(comment: Comment): Promise<void>;
    getCommentsByPostId(postId: string): Promise<Comment[]>;
    deleteComment(commentId: string, userId: string): Promise<void>;
}