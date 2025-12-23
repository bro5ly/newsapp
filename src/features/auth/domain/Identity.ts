import { Email } from "./Email";

export class Identity {
    constructor(
        public readonly id: string,
        public readonly email: Email,
        private _status: 'active' | 'locked',
        private _isEmailVerified: boolean
    ){}
    public canLogin(): boolean {
        return this._status === `active` && !this.isLocked()
    }
    public isLocked(): boolean {
        return this._status === 'locked';
    }

    public completeEmailVerification(): void {
        this._isEmailVerified = true
    }

    public lock(): void {
        this._status = 'locked'
    }
}