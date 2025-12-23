export class Password {
    private readonly _value: string
    constructor(value: string){
        if(!this.validate(value)){
            throw new Error(`不正なパスワードです${value}`)
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