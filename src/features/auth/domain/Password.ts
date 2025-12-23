import { ValidationError } from "@/packages/domain/errors/ValidationError";

export class Password {
    private readonly _value: string
    constructor(value: string){
        if(!this.validate(value)){
            throw new ValidationError(`不正なパスワードです`)
        }
        this._value = value
    }

    private validate(password: string): boolean {
        const hasNumber = /\d/.test(password);
        const hasAlpha = /[a-zA-Z]/.test(password);
        return password.length >= 8 && hasNumber && hasAlpha
    }

    public getRowValue(): string {
        return this._value
    }
}