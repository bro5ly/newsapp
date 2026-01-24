import { Tables } from '@/lib/database.types' // 型定義ファイルのパス

// ドメインモデルとしてのComment型
export type Comment = Tables<'comments'>

export const createComment = (props: {
    content: string;
    post_id: string;
    user_id: string;
}): Omit<Comment, 'id' | 'created_at'> => {
    // 薄いドメインルール: 文字数制限
    if (!props.content.trim()) throw new Error("コメントを入力してください");
    if (props.content.length > 400) throw new Error("コメントは400文字以内でお願いします");

    return {
        content: props.content,
        post_id: props.post_id,
        user_id: props.user_id,
    };
};