import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import textToSpeech from '@google-cloud/text-to-speech';

// Google Cloud TTS クライアントの初期化
// ※環境変数 GOOGLE_APPLICATION_CREDENTIALS にJSONパスが設定されている前提
const ttsClient = new textToSpeech.TextToSpeechClient();

export async function POST(req: NextRequest) {
    try {
        const { textToDisplay, imageName } = await req.json();

        const rootDir = process.cwd();
        const paths = {
            video: path.join(rootDir, 'public/templates/caster.mp4'),
            face: path.join(rootDir, 'public/uploads', imageName || 'user_face.jpg'),
            frame: path.join(rootDir, 'public/frames/telop_box.png'),
            audio: path.join(rootDir, 'public/audio/news_bgm.mp3'),
            font: path.join(rootDir, 'public/fonts/news-bold.ttf'),
            outputDir: path.join(rootDir, 'public/output'),
            tempAudio: path.join(rootDir, 'public/output', `tts_${Date.now()}.mp3`),
        };

        if (!fs.existsSync(paths.outputDir)) {
            fs.mkdirSync(paths.outputDir, { recursive: true });
        }

        // --- 1. Google Cloud TTS でナレーション生成 ---
        const [ttsResponse] = await ttsClient.synthesizeSpeech({
            input: { text: textToDisplay },
            voice: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' }, // 落ち着いた女性
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.05, // ニュースらしいキレのある速度
                pitch: -1.0         // 落ち着いたトーン
            },
        });

        if (ttsResponse.audioContent) {
            fs.writeFileSync(paths.tempAudio, ttsResponse.audioContent as Buffer);
        } else {
            throw new Error('TTS audio content is empty');
        }

        const outputFileName = `news_${Date.now()}.mp4`;
        const outputPath = path.join(paths.outputDir, outputFileName);

        // --- 2. アニメーション数式 ---
        // 0.5秒かけて右からスライドイン
        const slideX = "if(lte(t,0.5), W-(W-(W-w)/2)*t/0.5, (W-w)/2)";
        const textX = "if(lte(t,0.5), W-(W-((w-tw)/2+50))*t/0.5, (w-tw)/2+50)";

        // --- 3. FFmpeg 実行 ---
        await new Promise<void>((resolve, reject) => {
            ffmpeg(paths.video)
                .input(paths.face)
                .input(paths.frame)
                .input(paths.audio)    // 3:a (BGM)
                .input(paths.tempAudio) // 4:a (ナレーション)
                .complexFilter([
                    // 映像：顔写真リサイズ＆重ね
                    { filter: 'scale', options: { w: 400, h: 400 }, inputs: '1:v', outputs: 'face' },
                    { filter: 'overlay', options: { x: 100, y: 100 }, inputs: ['0:v', 'face'], outputs: 'v1' },

                    // 映像：テロップ枠スライド
                    { filter: 'overlay', options: { x: slideX, y: 'H-h-60' }, inputs: ['v1', '2:v'], outputs: 'v2' },

                    // 映像：文字スライド
                    {
                        filter: 'drawtext',
                        options: {
                            fontfile: paths.font,
                            text: textToDisplay,
                            x: textX, y: 'h-185',
                            fontsize: 70, fontcolor: 'black',
                            shadowx: 2, shadowy: 2, shadowcolor: 'white@0.3'
                        },
                        inputs: 'v2', outputs: 'v_final'
                    },

                    // 音声：BGMとナレーションをミックス
                    // BGMを少し下げ、ナレーションをメインにする
                    { filter: 'volume', options: { volume: 0.3 }, inputs: '3:a', outputs: 'bgm_low' },
                    {
                        filter: 'amix',
                        options: { inputs: 2, duration: 'first', dropout_transition: 0 },
                        inputs: ['bgm_low', '4:a'],
                        outputs: 'a_mixed'
                    }
                ])
                .outputOptions([
                    '-map [v_final]',
                    '-map [a_mixed]',
                    '-t 8' // 8秒固定
                ])
                .videoCodec('libx264')
                .audioCodec('aac')
                .on('start', (cmd) => console.log('FFmpeg command:', cmd))
                .on('end', () => {
                    if (fs.existsSync(paths.tempAudio)) fs.unlinkSync(paths.tempAudio);
                    resolve();
                })
                .on('error', (err) => {
                    if (fs.existsSync(paths.tempAudio)) fs.unlinkSync(paths.tempAudio);
                    reject(err);
                })
                .save(outputPath);
        });

        return NextResponse.json({ url: `/output/${outputFileName}` });

    } catch (error: any) {
        console.error('Final Generation Error:', error);
        return NextResponse.json({
            message: '動画生成に失敗しました',
            error: error.message
        }, { status: 500 });
    }
}