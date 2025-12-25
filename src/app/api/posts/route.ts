import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // 既存のクライアント
import { SupabasePostRepository } from '@/features/posts/infrastructure/SupabasePostRepository';
import { CloudflareR2VideoService } from '@/features/posts/infrastructure/CloudflareR2VideoService';
import { CreateVideoPostUseCase } from '@/features/posts/application/CreateVideoPostUseCase';
import { Post, PrivacyScope } from '@/features/posts/domain/Post';

// export async function POST(request: Request) {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const body = await request.json();
//     const { prompt, sceneType, title, privacyScope } = body; // 値をコピーしておく
//     // 1. 依存関係の注入 (DI)
//     const postRepo = new SupabasePostRepository(supabase);
//     // app/api/posts/route.ts の一部
// const videoService = new CloudflareR2VideoService({
//     accountId: process.env.R2_ACCOUNT_ID!,
//     accessKeyId: process.env.R2_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
//     bucketName: process.env.R2_BUCKET_NAME!,
//     publicUrl: process.env.R2_PUBLIC_DOMAIN!,
//     mockFilename: process.env.MOCK_VIDEO_FILENAME!, // 追加
// });

//     const useCase = new CreateVideoPostUseCase(postRepo, videoService);

//     try {
//         // 2. ユースケース実行
//         // 注：内部で非同期の .then() が走るため、HTTPレスポンスは即座に返る
//         const postId = await useCase.execute({
//             userId: user.id,
//             title: body.title || "Untitled Video",
//             content: body.prompt,
//             sceneType: body.sceneType,
//             privacyScope: body.privacyScope || 'PRIVATE',
//         });

//         return NextResponse.json({ postId, message: "Generation started" });
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }
//     try {


//         const post = new Post(
//             crypto.randomUUID(),
//             user.id,
//             title || "Untitled",
//             prompt, // コピーした変数を使用
//             null,
//             sceneType, // コピーした変数を使用
//             privacyScope || 'PRIVATE',
//             'PENDING',
//             new Date()
//         );
//         await postRepo.save(post);

//         // 2. 動画生成を「待たずに」開始する
//         // .then() を使うことで、この関数自体はすぐにレスポンスを返せます
//         videoService.generate(sceneType, prompt)
//             .then(async (url) => {
//                 post.complete(url);
//                 await postRepo.save(post);
//                 console.log("Success: Video generated and saved");
//             })
//             .catch(async (err) => {
//                 post.fail();
//                 await postRepo.save(post);
//                 console.error("Failed: Background generation error", err);
//             });

//         // 3. 保存したばかりの ID を即座に返して、フロントを遷移させる
//         return NextResponse.json({ postId: post.id });
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// app/api/posts/route.ts
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // 【重要】bodyからプリミティブな値をコピー（値渡しを確実にする）
    const inputForUseCase = {
        userId: user.id,
        title: String(body.title || "Untitled"),
        content: String(body.prompt || ""),
        sceneType: String(body.sceneType || ""),
        privacyScope: (body.privacyScope || 'PRIVATE') as PrivacyScope,
    };

    const postRepo = new SupabasePostRepository(supabase);
    const videoService = new CloudflareR2VideoService({
        accountId: process.env.R2_ACCOUNT_ID!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        bucketName: process.env.R2_BUCKET_NAME!,
        publicUrl: process.env.R2_PUBLIC_DOMAIN!,
        mockFilename: process.env.MOCK_VIDEO_FILENAME!, // 追加
    });
    const useCase = new CreateVideoPostUseCase(postRepo, videoService);

    try {
        // コピーした値を渡すので、この後 API がレスポンスを返しても
        // ユースケース内の非同期処理は影響を受けません
        const postId = await useCase.execute(inputForUseCase);

        return NextResponse.json({ postId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}