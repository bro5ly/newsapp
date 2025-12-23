import { Email } from "./Email";
import { Identity } from "./Identity";
import { Password } from "./Password";

export interface AuthRepository {
    signIn(email: Email, password: Password): Promise<Identity>
    signUp(email: Email, password: Password): Promise<void>

    getCurrentIdentity(): Promise<Identity | null>
    signOut(): Promise<void>
    resetPassword(email: Email): Promise<void>
}