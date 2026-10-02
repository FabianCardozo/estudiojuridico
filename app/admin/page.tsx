import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLawyerSession } from "../lawyer-auth";
import AdminLicenses from "./admin-licenses";

export const metadata = { title: "Administración comercial | GIAN" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getLawyerSession();
  if (!session) redirect("/cuenta");
  if (!session.isPlatformAdmin) redirect("/");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("licenses").select("id,code_hint,customer_name,customer_email,license_type,plan,status,user_limit,expires_at,activated_at,created_at").order("created_at", { ascending: false });
  return <AdminLicenses initialLicenses={data || []} />;
}
