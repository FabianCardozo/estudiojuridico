import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export type LawyerSession = { accountId: string; email: string };

export async function getLawyerSession(): Promise<LawyerSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { accountId: data.user.id, email: data.user.email || "" };
}

export async function destroyLawyerSession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function getPublicProfile(bookingCode?: string | null) {
  const supabase = createSupabasePublicClient();
  if (!bookingCode) return null;
  const { data } = await supabase
    .from("lawyer_profiles")
    .select("user_id,booking_code,full_name,gender,specialty,photo_path,booking_enabled")
    .eq("booking_code", bookingCode)
    .eq("booking_enabled", true)
    .maybeSingle();
  return data;
}
