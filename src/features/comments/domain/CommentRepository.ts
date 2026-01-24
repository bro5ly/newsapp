import { Comment } from "./Comment";
import { TablesInsert } from "@/lib/database.types";

export interface ICommentRepository {
    save(comment: TablesInsert<'comments'>): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
    findByPostId(postId: string): Promise<Comment[]>;
}