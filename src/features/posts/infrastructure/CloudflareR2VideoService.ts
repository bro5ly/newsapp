// features/post/infrastructure/CloudflareR2VideoService.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { VideoService } from "../domain/VideoService";

export class CloudflareR2VideoService implements VideoService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;
    private mockFilename: string;

    constructor(config: {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
        publicUrl: string;
        mockFilename: string; // 追加
    }) {
        this.s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        this.bucketName = config.bucketName;
        this.publicUrl = config.publicUrl;
        this.mockFilename = config.mockFilename;
    }

    async generate(sceneType: string, prompt: string): Promise<string> {
        // モックモードの判定
        if (process.env.NEXT_PUBLIC_VEO_MOCK === "true") {
            return this.mockGenerate(sceneType, prompt);
        }

        // --- 本番ロジック (Veo API 呼び出し等) ---
        // ここは将来的に実装
        throw new Error("Veo API integration not implemented yet. Use MOCK mode.");
    }

    private async mockGenerate(scene: string, prompt: string): Promise<string> {
        console.log(`[Mock Veo] Generating... Scene: ${scene}, Prompt: ${prompt}`);

        // 生成を待っているフリ（3秒）
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // 環境変数から組み立てたモックURLを返す
        // 例: https://pub-xxx.r2.dev/0eeff613-aa08...mp4
        return `${this.publicUrl}/${this.mockFilename}`;
    }

    // R2への実際のアップロード（本番用）
    private async uploadToR2(base64: string): Promise<string> {
        const fileName = `${crypto.randomUUID()}.mp4`;
        const buffer = Buffer.from(base64, "base64");

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: "video/mp4",
        }));

        return `${this.publicUrl}/${fileName}`;
    }
}