import {getLawyerSession} from "../lawyer-auth";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import RequestsBoard from "./requests-board";
export const dynamic="force-dynamic";
export default async function RequestsPage(){const user=await getLawyerSession();if(!user)redirect("/cuenta");const supabase=await createSupabaseServerClient();const {data:p}=await supabase.from("lawyer_profiles").select("full_name,specialty,booking_code").eq("user_id",user.accountId).maybeSingle();return <RequestsBoard lawyerName={p?.full_name||user.email} specialty={p?.specialty||"Abogado/a"} bookingCode={p?.booking_code||""}/>}
