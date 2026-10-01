import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Ingresá un correo válido." }, { status: 422 });
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/cuenta?recuperar=1` });
  if (error) return Response.json({ error: "No se pudo enviar el correo de recuperación." }, { status: 400 });
  return Response.json({ ok: true, message: "Revisá tu correo para continuar con la recuperación." });
}
