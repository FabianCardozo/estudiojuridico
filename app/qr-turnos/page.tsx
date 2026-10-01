import { ArrowLeft, ExternalLink, QrCode, ScanLine, ShieldCheck, Scale } from "lucide-react";
import {getLawyerSession} from "../lawyer-auth";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import QrPoster from "./qr-poster";

export const metadata = { title: "Código QR para entrevistas | Centro de Gestión Jurídica" };

export const dynamic="force-dynamic";
export default async function QrTurnosPage() {
  const session=await getLawyerSession();if(!session)redirect("/cuenta?next=/qr-turnos");
  const supabase=await createSupabaseServerClient();
  const {data:profile}=await supabase.from("lawyer_profiles").select("*").eq("user_id",session.accountId).maybeSingle();
  if(!profile)redirect("/configuracion");
  const name=profile?.full_name||"tu abogado de confianza";
  const specialty=profile?.specialty||"Asesoramiento jurídico";
  const title = profile.gender==="female" ? "Dra." : "Dr.";
  const titledName = /^(dr\.?|dra\.?)\s/i.test(name) ? name : `${title} ${name}`;
  const publicForm=`/solicitar?codigo=${profile.booking_code}`;
  return (
    <main className="qr-page">
      <header className="public-header">
        <a href="/solicitudes"><ArrowLeft /> Ir a solicitudes</a>
        <span><ShieldCheck /> Formulario público seguro</span>
      </header>
      <section className="qr-hero">
        <div className="qr-copy">
          <span className="eyebrow"><QrCode /> Acceso para clientes potenciales</span>
          <h1>Necesitás un abogado, agendá una entrevista con <strong>{titledName}</strong></h1>
          <p>Imprimí o compartí este código. Al escanearlo, la persona podrá dejar sus datos, canal de contacto, disponibilidad y motivo de consulta.</p>
          <div className="qr-steps"><span><b>1</b> Escanea</span><span><b>2</b> Completa</span><span><b>3</b> El estudio agenda</span></div>
          <a className="qr-open" href={publicForm} target="_blank">Abrir formulario <ExternalLink /></a>
        </div>
        <div className="qr-panel">
          <span className="scan-corner"><ScanLine /></span>
          <h3>Necesitás un abogado, agendá una entrevista con <b>{titledName}</b></h3>
          <QrPoster name={titledName} specialty={specialty} hasPhoto={Boolean(profile.photo_path)} license={profile.license_number||""} phone={profile.phone||""} address={profile.address||""} bookingPath={publicForm} bookingCode={profile.booking_code}/>
          <strong>Escaneá este código y agendá una entrevista</strong>
          <div className="qr-client-copy"><Scale /><p><b>Tu problema merece ser escuchado.</b><span>Recibí orientación jurídica clara, confidencial y comprometida. Da el primer paso: solicitá una entrevista.</span></p></div>
          {profile.photo_path&&<img className="qr-lawyer-photo" src={`/api/profile/photo?code=${profile.booking_code}`} alt={`Foto de ${titledName}`}/>} 
          <h2>{titledName}</h2><p>{specialty}</p>
        </div>
      </section>
    </main>
  );
}
