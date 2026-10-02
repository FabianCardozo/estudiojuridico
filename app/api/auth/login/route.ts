import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const activationCode = String((body as { activationCode?: string } | null)?.activationCode || "").trim().toUpperCase();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(body?.password || "") });
  if (error) return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  let { data: access } = await supabase.rpc("account_access_status");
  if (!access?.authorized && activationCode) {
    const codeHash = createHash("sha256").update(activationCode).digest("hex");
    const { error: claimError } = await supabase.rpc("claim_license", { p_code_hash: codeHash });
    if (claimError) return Response.json({ error: "Ingresaste correctamente, pero el código de activación no es válido o ya fue utilizado.", licenseRequired: true }, { status: 403 });
    ({ data: access } = await supabase.rpc("account_access_status"));
  }
  if (!access?.authorized) return Response.json({ error: "La cuenta no tiene una licencia activa. Ingresá el código entregado por GIAN.", licenseRequired: true }, { status: 403 });
  return Response.json({ ok: true });
}
