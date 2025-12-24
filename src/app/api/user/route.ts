import { NextResponse } from "next/server";
import { z } from "zod";
import { changeDisplayName } from "@/users/application/changeDisplayName";
import { supabaseUserRepository } from "@/shared/supabase/userRepository";
import { createServerClient } from "@/shared/supabase/serverClient";

const schema = z.object({
  displayName: z.string(),
});

export async function PATCH(req: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.parse(await req.json());

  await changeDisplayName(
    supabaseUserRepository,
    user.id,
    body.displayName
  );

  return NextResponse.json({ ok: true });
}
