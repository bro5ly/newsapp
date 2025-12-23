export abstract class DomainError extends Error {
  /**
   * @param message ログや画面に表示するメッセージ
   * @param code プログラムで判別するためのコード (例: 'AUTH_FAILED')
   */
  constructor(
    public readonly message: string,
    public readonly code: string = 'DOMAIN_ERROR'
  ) {
    super(message);
    
    // クラス名を Error.name にセット
    this.name = this.constructor.name;

    // TypeScriptでカスタムエラーの型判定 (instanceof) を正常に動作させるために必要
    Object.setPrototypeOf(this, new.target.prototype);

    // スタックトレース（どこでエラーが起きたか）を保持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}