export class Email {
    private readonly _value: string
    constructor(value: string){
        if(!this.validate(value)){
            throw new Error(`不正なメールアドレスの形式です${value}`)
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