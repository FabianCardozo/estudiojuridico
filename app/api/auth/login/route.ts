import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(body?.password || "") });
  if (error) return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  return Response.json({ ok: true });
}
