import { SignOutUseCase } from "@/features/auth/application/SignoutUseCase";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/SupabaseAuthRepository";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const useCase = new SignOutUseCase(repository);

  await useCase.execute();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}