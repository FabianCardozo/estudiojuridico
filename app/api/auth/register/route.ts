import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = clean(body?.email, 160).toLowerCase();
  const password = String(body?.password ?? "");
  const fullName = clean(body?.fullName, 120);
  const activationCode = clean(body?.activationCode, 80).toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || fullName.length < 4)
    return Response.json({ error: "Ingresá nombre completo, un correo válido y una contraseña de al menos 8 caracteres." }, { status: 422 });
  const supabase = await createSupabaseServerClient();
  const codeHash = createHash("sha256").update(activationCode).digest("hex");
  const { data: available } = await supabase.rpc("license_available", { p_code_hash: codeHash, p_email: email });
  if (!available) return Response.json({ error: "El código de activación no es válido, venció o corresponde a otro correo." }, { status: 403 });
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data.user) return Response.json({ error: "No se pudo crear la cuenta." }, { status: 400 });
  if (data.session) {
    const { error: claimError } = await supabase.rpc("claim_license", { p_code_hash: codeHash });
    if (claimError) return Response.json({ error: "La cuenta fue creada, pero no se pudo activar la licencia." }, { status: 409 });
  }
  return Response.json({ ok: true, requiresEmailConfirmation: !data.session, activationPending: !data.session });
}
