import { GoogleSignInUseCase } from "@/features/auth/application/GoogleSigninUseCase";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/SupabaseAuthRepository";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const useCase = new GoogleSignInUseCase(repository);

  const result = await useCase.execute();
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ data: result.data });
}