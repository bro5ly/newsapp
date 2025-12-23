import { SupabaseClient } from "@supabase/supabase-js";
import { AuthRepository } from "../domain/AuthRepository";
import { Email } from "../domain/Email";
import { Identity } from "../domain/Identity";
import { Password } from "../domain/Password";
import { AuthenticationError } from "../errors/AuthenticationError";
import { InfrastructureError } from "../errors/InfrastructureError";

export class SupabaseAuthRepository implements AuthRepository{
    constructor(private readonly supabase: SupabaseClient){}

    async signIn(email: Email, password: Password): Promise<Identity> {
        //voインスタンスを文字列に戻してsupabaeクライアントを用いて認証
        const { data: { user },error } = await this.supabase.auth.signInWithPassword({
            email: email.toString(),
            password: password.getRowValue()
        })

        //エラーかユーザーデータが存在しないとき、カスタムエラーを用いてプロセスを強制停止
        if(error){
            if(error.status === 400){
                throw new AuthenticationError('メールまたはパスワードが正しくありません')
            }
            throw new InfrastructureError(error.message)
        }
        if(!user) throw new InfrastructureError('ユーザーデータが見つかりませんでした')
        
        //生データをエンティティクラスに変換
        return this.mapToDomain(user)
    }

    async getCurrentIdentity(): Promise<Identity | null> {
        //supabaseで認証とユーザー情報の取得
        const {data: {user}, error} = await this.supabase.auth.getUser();

        //確認だけなのでエラーの発生、もしくはユーザーが存在しない場合nullを返す
        if(error || !user) return null;

        return this.mapToDomain(user)
    }

    async signUp(email: Email, password: Password): Promise<Identity> {
        const {data: {user}, error} = await this.supabase.auth.signUp({
            email: email.toString(),
            password: password.getRowValue()
        });
        
        if (error) throw new InfrastructureError(error.message)
        
        if(!user) throw new InfrastructureError('ユーザー作成に失敗しました')
        
        return this.mapToDomain(user)
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
    }

    async resetPassword(email: Email): Promise<void> {
        await this.supabase.auth.resetPasswordForEmail(email.toString())
    }

    private mapToDomain(supabaseUser: any): Identity {
        //デフォはアクティブ（ここの型は別で定義してエンティティと共有するべき...?）
        let status : 'active' | 'locked' = 'active'

        //アカウント凍結の検証
        if(supabaseUser.banned_untill || supabaseUser.user_metadata?.is_banned){
            status = 'locked'
        }
        
        //インスタンスの生成
        return new Identity(
            supabaseUser.id,
            new Email(supabaseUser.email || ''),
            status,
            !!supabaseUser.email_comfirmed_at
        )
    }
}