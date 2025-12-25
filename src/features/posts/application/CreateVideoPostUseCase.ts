// features/post/application/CreateVideoPostUseCase.ts

import { Post, PrivacyScope } from '../domain/Post';
import { PostRepository } from '../domain/PostRepository';
import { VideoService } from '../domain/VideoService';

// features/post/application/CreateVideoPostUseCase.ts

export class CreateVideoPostUseCase {
  constructor(
    private postRepo: PostRepository,
    private videoService: VideoService
  ) { }

  async execute(input: {
    userId: string;
    title: string;
    content: string; // ここで body.prompt などの値がコピーされて渡される
    sceneType: string;
    privacyScope: PrivacyScope;
  }): Promise<string> {
    // 1. 値の固定（念のため、このスコープ内で確実に保持）
    const { userId, title, content, sceneType, privacyScope } = input;
    const createdAt = new Date();

    const visibilityExpiresAt = new Date(createdAt);
    visibilityExpiresAt.setHours(visibilityExpiresAt.getHours() + 24);

    const post = new Post(
      crypto.randomUUID(),
      userId,
      title,
      content,
      null,
      sceneType,
      privacyScope,
      'PENDING',
      createdAt,
      visibilityExpiresAt
    );

    // 2. 最初の保存（ここで postId が確定）
    await this.postRepo.save(post);

    // 3. 非同期生成（ここがポイント：クロージャにより content 等の値は保持されます）
    // awaitせずに実行し、すぐに結果を return する
    this.videoService.generate(sceneType, content)
      .then(async (videoUrl) => {
        // 保存済みのエンティティの状態を更新して再保存
        post.complete(videoUrl);
        await this.postRepo.save(post);
      })
      .catch(async (error) => {
        post.fail();
        await this.postRepo.save(post);
        console.error("Background error:", error);
      });

    return post.id;
  }
}