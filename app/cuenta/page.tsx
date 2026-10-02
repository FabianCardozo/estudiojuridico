import { Scale } from "lucide-react";
import AccountForm from "./account-form";

export const metadata={title:"Acceso del abogado | Centro de Gestión Jurídica"};
export default function AccountPage(){return <main className="account-page"><section className="account-shell"><div className="account-visual"><span><Scale/></span><p>GESTIÓN PRIVADA</p><h1>Tu estudio jurídico, organizado en un solo lugar.</h1><ul><li>Clientes y solicitudes centralizados</li><li>Agenda, expedientes y honorarios</li><li>Perfil profesional y QR personalizado</li></ul></div><AccountForm/></section></main>}
