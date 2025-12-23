import { AuthRepository } from "../domain/AuthRepository";
import { Email } from "../domain/Email";
import { Identity } from "../domain/Identity";
import { Password } from "../domain/Password";

interface LoginInput {
    email: string,
    password: string
}

export class LoginUseCase {
    constructor(private readonly authRepository: AuthRepository){}

    async execute(input: LoginInput): Promise<Identity>{
        const email = new Email(input.email); 
        const password = new Password(input.password)

        const identity = await this.authRepository.signIn(email,password)

        if(!identity.canLogin){
            throw new Error('このアカウントはロックされています')
        }

        return identity
    }
}