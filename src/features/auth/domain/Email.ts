import { ValidationError } from "@/packages/domain/errors/ValidationError";

export class Email {
    private readonly _value: string
    constructor(value: string){
        if(!this.validate(value)){
            throw new ValidationError(`不正なメールアドレスの形式です`)
        }
        this._value = value.toLowerCase().trim()
    }
    private validate(email: string): boolean{
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public equal(other: Email): boolean {
        return this._value === other.toString()
    }

    public toString(): string {
        return this._value
    }
}