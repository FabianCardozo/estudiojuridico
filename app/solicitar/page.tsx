import RequestForm from "./request-form";
import { ArrowLeft, Scale, ShieldCheck } from "lucide-react";
import {getPublicProfile} from "../lawyer-auth";

export const metadata = { title: "Solicitar entrevista | Centro de Gestión Jurídica", description: "Solicitud de entrevista con el estudio jurídico." };

export const dynamic="force-dynamic";
export default async function RequestPage({searchParams}:{searchParams:Promise<{codigo?:string}>}) {
  const {codigo=""}=await searchParams;
  const profile=await getPublicProfile(codigo);
  if(!profile)return <main className="request-page"><section className="request-content"><div className="request-intro"><span><ShieldCheck /> Enlace no válido</span><h2>Este código QR no corresponde a un abogado habilitado</h2><p>Solicitá al profesional su cartel o enlace actualizado.</p></div></section></main>;
  return (
    <main className="request-page">
      <header className="request-header"><div><span className="request-logo"><Scale /></span><div><p>SOLICITUD DE ENTREVISTA</p><h1>{profile?.full_name||"Estudio jurídico"}</h1></div><a href="/qr-turnos"><ArrowLeft /> Ver código QR</a></div></header>
      <section className="request-content"><div className="request-intro"><span><ShieldCheck /> Solicitud confidencial</span><h2>Contanos brevemente en qué podemos ayudarte</h2><p>Completá tus datos. El envío no confirma el turno: el estudio revisará la información y se comunicará para acordar día y horario.</p></div><RequestForm bookingCode={codigo}/></section>
      <footer className="request-footer"><ShieldCheck /> La información será utilizada únicamente para gestionar esta solicitud.</footer>
    </main>
  );
}
