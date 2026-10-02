import DashboardClient from "./dashboard-client";
import { getLawyerSession } from "./lawyer-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarPlus, QrCode, Settings, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getLawyerSession();
  if (!session) redirect("/cuenta");
  const supabase=await createSupabaseServerClient();
  const {data:profile}=await supabase.from("lawyer_profiles").select("full_name,specialty,photo_path").eq("user_id",session.accountId).maybeSingle();
  return <><DashboardClient profile={{fullName:profile?.full_name||session.email,specialty:profile?.specialty||"Abogado/a",hasPhoto:Boolean(profile?.photo_path)}} /><div className="quick-actions"><a href="/configuracion"><Settings />Configuración</a><a href="/qr-turnos"><QrCode />Código QR</a><a href="/solicitudes"><CalendarPlus />Solicitudes</a>{session.isPlatformAdmin&&<a href="/admin"><ShieldCheck />Administración GIAN</a>}</div></>;
}
