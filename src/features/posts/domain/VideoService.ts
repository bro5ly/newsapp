// features/post/domain/VideoService.ts

export interface VideoService {
    /**
     * シーン情報とプロンプトを元に動画を生成し、
     * ストレージに保存した後の最終的な公開URLを返す。
     * 内部で「Base64デコード」と「R2へのアップロード」を担う。
     */
    generate(sceneType: string, prompt: string): Promise<string>;
}