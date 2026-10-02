import { createHash, randomBytes } from "node:crypto";
import { getLawyerSession } from "../../../lawyer-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  const session = await getLawyerSession();
  if (!session?.isPlatformAdmin) return Response.json({ error: "Acceso exclusivo de GIAN." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const customerName = clean(body?.customerName, 120);
  const customerEmail = clean(body?.customerEmail, 160).toLowerCase() || null;
  const plan = ["individual", "estudio", "demo"].includes(String(body?.plan)) ? String(body?.plan) : "individual";
  const userLimit = Math.max(1, Math.min(50, Number(body?.userLimit) || 1));
  const expiresAt = clean(body?.expiresAt, 30) || null;
  if (customerName.length < 3 || (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)))
    return Response.json({ error: "Ingresá un cliente y un correo válido." }, { status: 422 });

  const raw = randomBytes(8).toString("hex").toUpperCase();
  const code = `GIAN-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12)}`;
  const codeHash = createHash("sha256").update(code).digest("hex");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("licenses").insert({ code_hash: codeHash, code_hint: `••••${code.slice(-4)}`, customer_name: customerName, customer_email: customerEmail, plan, user_limit: userLimit, expires_at: expiresAt, created_by: session.accountId });
  if (error) return Response.json({ error: "No se pudo emitir la licencia." }, { status: 400 });
  return Response.json({ ok: true, code });
}

export async function PATCH(request: Request) {
  const session = await getLawyerSession();
  if (!session?.isPlatformAdmin) return Response.json({ error: "Acceso exclusivo de GIAN." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; status?: string } | null;
  const status = String(body?.status || "");
  if (!body?.id || !["pending", "active", "suspended", "cancelled"].includes(status)) return Response.json({ error: "Cambio inválido." }, { status: 422 });
  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase.from("licenses").select("license_type").eq("id", body.id).single();
  if (current?.license_type === "platform_admin") return Response.json({ error: "La licencia administradora principal no puede suspenderse desde este panel." }, { status: 403 });
  const { data: license, error } = await supabase.from("licenses").update({ status }).eq("id", body.id).select("organization_id").single();
  if (error) return Response.json({ error: "No se pudo cambiar la licencia." }, { status: 400 });
  if (license.organization_id) await supabase.from("organizations").update({ status: status === "active" ? "active" : "suspended" }).eq("id", license.organization_id);
  return Response.json({ ok: true });
}
