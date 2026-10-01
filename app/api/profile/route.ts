import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLawyerSession, getPublicProfile } from "../../lawyer-auth";
const clean=(v:unknown,n:number)=>String(v??"").trim().slice(0,n);
export async function GET(request:Request){
  const code=new URL(request.url).searchParams.get("code");
  if(code)return Response.json({profile:await getPublicProfile(code)});
  const session=await getLawyerSession();if(!session)return Response.json({error:"No autorizado"},{status:401});
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from("lawyer_profiles").select("*").eq("user_id",session.accountId).single();
  return error?Response.json({error:"No se pudo obtener el perfil."},{status:500}):Response.json({profile:data});
}
export async function PUT(request:Request){
  const session=await getLawyerSession();if(!session)return Response.json({error:"No autorizado"},{status:401});
  const b=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const fullName=clean(b?.fullName,120),specialty=clean(b?.specialty,160),email=clean(b?.email,160).toLowerCase();
  if(fullName.length<4||specialty.length<3||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:"Revisá nombre, especialidad y correo."},{status:422});
  const supabase=await createSupabaseServerClient();
  const {error}=await supabase.from("lawyer_profiles").update({full_name:fullName,specialty,license_number:clean(b?.licenseNumber,80)||null,phone:clean(b?.phone,40)||null,contact_email:email,address:clean(b?.address,180)||null,bio:clean(b?.bio,600)||null}).eq("user_id",session.accountId);
  return error?Response.json({error:"No se pudieron guardar los datos."},{status:500}):Response.json({ok:true});
}
