import {redirect} from "next/navigation";
import {getLawyerSession} from "../lawyer-auth";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import ProfileForm from "./profile-form";
export const dynamic="force-dynamic";
export default async function SettingsPage(){const session=await getLawyerSession();if(!session)redirect("/cuenta?next=/configuracion");const supabase=await createSupabaseServerClient();const {data:p}=await supabase.from("lawyer_profiles").select("full_name,specialty,license_number,phone,contact_email,address,bio,photo_path").eq("user_id",session.accountId).maybeSingle();if(!p)redirect("/cuenta?next=/configuracion");return <ProfileForm initial={{...p,email:p.contact_email||session.email,photo_key:p.photo_path||undefined}}/>}
