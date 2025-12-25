// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseProfileRepository } from '@/features/user/infrastructure/SupabaseProfileRepository';
import { GetMyProfileUseCase } from '@/features/user/application/GetMyProfileUseCase';
import { UpdateProfileUseCase } from '@/features/user/application/UpdateProfileUseCase';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profileRepo = new SupabaseProfileRepository(supabase);
    const useCase = new GetMyProfileUseCase(profileRepo);

    try {
        const profile = await useCase.execute(user.id);
        return NextResponse.json(profile);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const profileRepo = new SupabaseProfileRepository(supabase);
    const useCase = new UpdateProfileUseCase(profileRepo);

    try {
        await useCase.execute(user.id, {
            displayName: body.display_name,
            avatarUrl: body.avatar_url,

        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}