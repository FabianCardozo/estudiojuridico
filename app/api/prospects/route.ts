import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLawyerSession, getPublicProfile } from "../../lawyer-auth";
const statuses=new Set(["Nueva","En revisión","Contactada","Confirmada","Rechazada","Cancelada"]);
const clean=(v:unknown,n:number)=>String(v??"").trim().slice(0,n);
export async function GET(){
  const session=await getLawyerSession();if(!session)return Response.json({error:"No autorizado"},{status:401});
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from("interview_requests").select("*").order("created_at",{ascending:false}).limit(500);
  if(error)return Response.json({error:"No se pudieron cargar las solicitudes."},{status:500});
  return Response.json({items:(data||[]).map(x=>({...x,document:x.document_number,preferred_time:x.other_availability,preferred_hour:String(x.preferred_time||"").slice(0,5),created_at:new Date(x.created_at).getTime(),updated_at:new Date(x.updated_at).getTime()}))});
}
export async function POST(request:Request){
  const b=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!b)return Response.json({error:"Solicitud inválida"},{status:400});
  if(clean(b.website,100))return Response.json({ok:true});
  const bookingCode=clean(b.bookingCode,80),profile=await getPublicProfile(bookingCode);
  if(!profile)return Response.json({error:"El código del abogado no es válido o no recibe solicitudes."},{status:404});
  const first=clean(b.firstName,80),last=clean(b.lastName,80),phone=clean(b.phone,30).replace(/[^0-9+]/g,""),reason=clean(b.reason,1200),email=clean(b.email,160),preferredDate=clean(b.preferredDate,10),preferredTime=clean(b.preferredHour,5);
  if(first.length<2||last.length<2||phone.replace(/\D/g,"").length<8||reason.length<10||!preferredDate||!preferredTime||b.consent!==true)return Response.json({error:"Revisá los datos obligatorios, la fecha, el horario y la autorización."},{status:422});
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:"El correo no es válido."},{status:422});
  const supabase=createSupabasePublicClient();
  const {data,error}=await supabase.from("interview_requests").insert({owner_id:profile.user_id,booking_code:bookingCode,first_name:first,last_name:last,document_number:clean(b.document,30)||null,phone,email:email||null,preferred_channel:clean(b.preferredChannel,30)||"WhatsApp",interview_mode:clean(b.interviewMode,30)||"Presencial",reason,preferred_date:preferredDate,preferred_time:preferredTime,other_availability:clean(b.preferredTime,120)||null,urgency:clean(b.urgency,30)||"Normal"}).select("id").single();
  if(error)return Response.json({error:"No pudimos registrar la solicitud. Intentá nuevamente."},{status:500});
  return Response.json({ok:true,id:data.id},{status:201});
}
export async function PATCH(request:Request){
  const session=await getLawyerSession();if(!session)return Response.json({error:"No autorizado"},{status:401});
  const b=await request.json().catch(()=>null) as Record<string,unknown>|null,id=clean(b?.id,80),requested=clean(b?.status,30),status=requested==="Agendada"?"Confirmada":requested==="Archivada"?"Cancelada":requested,appointmentAt=clean(b?.appointmentAt,40),internalNote=clean(b?.internalNote,600);
  if(!id||!statuses.has(status))return Response.json({error:"Actualización inválida"},{status:422});
  if(status==="Confirmada"&&!appointmentAt)return Response.json({error:"Indicá la fecha y la hora acordadas."},{status:422});
  const supabase=await createSupabaseServerClient();
  const {data:item}=await supabase.from("interview_requests").select("*").eq("id",id).maybeSingle();if(!item)return Response.json({error:"La solicitud ya no existe."},{status:404});
  const {error}=await supabase.from("interview_requests").update({status,appointment_at:appointmentAt||null,internal_note:internalNote||null}).eq("id",id);
  if(error)return Response.json({error:"No se pudo actualizar la solicitud."},{status:500});
  if(status==="Confirmada"&&appointmentAt)await supabase.from("calendar_events").insert({owner_id:session.accountId,title:`Entrevista con ${item.first_name} ${item.last_name}`,event_type:"Entrevista",starts_at:appointmentAt,notes:`WhatsApp: ${item.phone} · ${item.reason}`,status:"Confirmada"});
  return Response.json({ok:true,addedToAgenda:status==="Confirmada"});
}
