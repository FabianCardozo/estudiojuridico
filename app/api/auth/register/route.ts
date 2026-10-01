import { createSupabaseServerClient } from "@/lib/supabase/server";
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = clean(body?.email, 160).toLowerCase();
  const password = String(body?.password ?? "");
  const fullName = clean(body?.fullName, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || fullName.length < 4)
    return Response.json({ error: "Ingresá nombre completo, un correo válido y una contraseña de al menos 8 caracteres." }, { status: 422 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data.user) return Response.json({ error: "No se pudo crear la cuenta." }, { status: 400 });
  return Response.json({ ok: true, requiresEmailConfirmation: !data.session });
}
