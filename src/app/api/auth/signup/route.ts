import { SignUpUseCase } from "@/features/auth/application/SignupUseCase";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/SupabaseAuthRepository";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = await createClient();
  const repository = new SupabaseAuthRepository(supabase);
  const useCase = new SignUpUseCase(repository);

  const result = await useCase.execute(email, password);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ data: result.data });
}