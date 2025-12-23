import { DomainError } from "@/packages/domain/errors/DomainError";
import { AuthRepository } from "../domain/AuthRepository";
import { Email } from "../domain/Email";
import { Identity } from "../domain/Identity";
import { Password } from "../domain/Password";
import { AccountLockedError } from "../errors/AccountLockedError";

export interface LoginInput {
    email: string,
    password: string
}

export type LoginResult = 
    | { success: true, data: Identity }
    | { success: false, error: { message: string, code: string } }

export class LoginUseCase {
    constructor(private readonly authRepository: AuthRepository){}

    async execute(input: LoginInput): Promise<LoginResult>{
        try {
            //voでバリデーションをかけてアプリのルール自体を適応させる
            const email = new Email(input.email); 
            const password = new Password(input.password)
            
            //インターフェースの引数にvoのインスタンスを渡す
            const identity = await this.authRepository.signIn(email,password)

            //エンティティには副作用を排除してビジネスロジックのみを書くべきなので、振る舞いを呼び出してここでエラー処理をする
            if(!identity.canLogin()){
                throw new AccountLockedError('このアカウントは凍結されています')
            }

            return { success: true, data: identity }
            
        } catch (err) {
            //親クラスのDomainErrorで想定内の処理を判別して、errorのmessageとcodeで詳細を区別
            if(err instanceof DomainError) {
                return { success: false, error: { message: err.message, code: err.code } }
            }

            //想定しないエラー処理
            console.error('unexpected error', err)
            return { success: false, error: { message: '予期せぬエラーが発生しました。', code: 'UNKNOWN_ERROR'}}
        }
       
    }
}