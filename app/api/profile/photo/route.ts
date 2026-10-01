import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getLawyerSession } from "../../../lawyer-auth";
export async function GET(request:Request){
  const code=new URL(request.url).searchParams.get("code");
  const supabase=code?createSupabasePublicClient():await createSupabaseServerClient();
  let query=supabase.from("lawyer_profiles").select("photo_path");
  if(code)query=query.eq("booking_code",code).eq("booking_enabled",true);else{
    const session=await getLawyerSession();if(!session)return new Response(null,{status:401});query=query.eq("user_id",session.accountId);
  }
  const {data}=await query.maybeSingle();if(!data?.photo_path)return new Response(null,{status:404});
  const url=supabase.storage.from("lawyer-photos").getPublicUrl(data.photo_path).data.publicUrl;
  return Response.redirect(url,302);
}
export async function POST(request:Request){
  const session=await getLawyerSession();if(!session)return Response.json({error:"No autorizado"},{status:401});
  const form=await request.formData(),file=form.get("photo");
  if(!(file instanceof File)||!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5_000_000)return Response.json({error:"Subí una imagen JPG, PNG o WebP de hasta 5 MB."},{status:422});
  const supabase=await createSupabaseServerClient(),ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg",path=`${session.accountId}/perfil.${ext}`;
  const {error}=await supabase.storage.from("lawyer-photos").upload(path,file,{contentType:file.type,upsert:true});
  if(error)return Response.json({error:"No se pudo guardar la imagen."},{status:500});
  await supabase.from("lawyer_profiles").update({photo_path:path}).eq("user_id",session.accountId);
  return Response.json({ok:true});
}
