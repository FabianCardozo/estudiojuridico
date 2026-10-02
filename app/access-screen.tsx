import { ArrowRight, LockKeyhole, QrCode, Scale } from "lucide-react";
import Link from "next/link";

type Props = {
  signInHref: string;
  title: string;
  description: string;
};

export default function AccessScreen({ signInHref, title, description }: Props) {
  return (
    <main className="access-page">
      <section className="access-card">
        <div className="access-brand"><Scale /></div>
        <span className="access-kicker"><LockKeyhole /> Área privada del estudio</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <a className="access-primary" href={signInHref} target="_top">
          Ingresar con ChatGPT <ArrowRight />
        </a>
        <Link className="access-secondary" href="/qr-turnos">
          <QrCode /> Ver el código QR sin ingresar
        </Link>
        <small>Los datos de potenciales clientes permanecen protegidos.</small>
      </section>
    </main>
  );
}
