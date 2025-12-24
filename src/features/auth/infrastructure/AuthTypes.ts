// features/auth/infrastructure/AuthTypes.ts

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthErrorCode = 
  | 'AUTH_AUTHENTICATION_FAILED'
  | 'GOOGLE_AUTH_INIT_FAILED'
  | 'CALLBACK_ERROR'
  | 'ACCOUNT_LOCKED' // User BC側で判断するが、Authの結果型に含めておくと扱いやすい
  | 'USER_NOT_FOUND'
  | 'INVALID_PARAMETER'
  | 'SERVER_ERROR';

export type AuthResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { message: string; code: AuthErrorCode } };