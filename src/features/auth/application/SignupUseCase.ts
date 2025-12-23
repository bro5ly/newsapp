import { DomainError } from "@/packages/domain/errors/DomainError";
import { AuthRepository } from "../domain/AuthRepository";
import { Email } from "../domain/Email";
import { Password } from "../domain/Password";
import { LoginInput, LoginResult } from "./LoginUseCase";

// features/auth/application/SignUpUseCase.ts
export class SignUpUseCase {
    constructor(private readonly authRepository: AuthRepository) {}

    async execute(input: LoginInput): Promise<LoginResult> {
        try {
            const email = new Email(input.email);
            const password = new Password(input.password);

            // リポジトリ経由でSupabaseに登録（ハッシュ化はSupabaseが自動で実施）
            const identity = await this.authRepository.signUp(email, password);

            return { success: true, data: identity };

        } catch (err) {
            if (err instanceof DomainError) {
                return { success: false, error: { message: err.message, code: err.code } };
            }
            return { success: false, error: { message: "登録に失敗しました", code: "SIGNUP_ERROR" } };
        }
    }
}