import { SupabaseClient } from "@supabase/supabase-js";
import { AuthRepository } from "../domain/AuthRepository";
import { Email } from "../domain/Email";
import { Identity } from "../domain/Identity";
import { Password } from "../domain/Password";

export class SupabaseAuthRepository implements AuthRepository{
    constructor(private readonly supabase: SupabaseClient){}

    async signIn(email: Email, password: Password): Promise<Identity> {
        const {data: {user},error} = await this.supabase.auth.signInWithPassword({
            email: email.toString(),
            password: password.getRowValue()
        })

        if(error || !user){
            throw new Error(error?.message || 'ログインに失敗しました。')
        }

        return this.mapToDomain(user)
    }

    async getCurrentIdentity(): Promise<Identity | null> {
        const {data: {user}, error} = await this.supabase.auth.getUser();

        if(error || !user) return null;

        return this.mapToDomain(user)
    }

    async signUp(email: Email, password: Password): Promise<void> {
        const {error} = await this.supabase.auth.signUp({
            email: email.toString(),
            password: password.getRowValue()
        });
        
        if (error) throw new Error(error.message)
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
    }

    async resetPassword(email: Email): Promise<void> {
        await this.supabase.auth.resetPasswordForEmail(email.toString())
    }

    private mapToDomain(supabaseUser: any): Identity {
        let status : 'active' | 'locked' = 'active'

        if(supabaseUser.banned_untill || supabaseUser.user_metadata?.is_banned){
            status = 'locked'
        }
        return new Identity(
            supabaseUser.id,
            new Email(supabaseUser.email || ''),
            status,
            !!supabaseUser.email_comfirmed_at
        )
    }
}