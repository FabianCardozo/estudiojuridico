"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

type Mode = "login" | "register" | "reset";

export default function AccountForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [exists, setExists] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/status").then((r) => r.json() as Promise<{ accountExists: boolean }>).then((j) => {
      setExists(j.accountExists);
      setMode(j.accountExists ? "login" : "register");
    });
  }, []);

  async function submit(fd: FormData) {
    setBusy(true);
    setError("");
    try {
      const body = { fullName: fd.get("fullName"), email: fd.get("email"), password: fd.get("password"), activationCode: fd.get("activationCode") };
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({ error: "El servidor no pudo completar la operación." })) as { error?: string; requiresEmailConfirmation?: boolean; message?: string; licenseRequired?: boolean };
      if (!response.ok) {
        setError(result.error || "No pudimos completar el acceso.");
        setBusy(false);
        return;
      }
      if (result.requiresEmailConfirmation) {
        setError("Cuenta creada. Revisá tu correo y confirmá la dirección antes de ingresar.");
        setMode("login");
        setBusy(false);
        return;
      }
      if (mode === "reset") {
        setError(result.message || "Revisá tu correo para recuperar el acceso.");
        setMode("login");
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(location.search).get("next");
      location.href = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
    } catch {
      setError("No pudimos conectar con el servidor. Intentá nuevamente.");
      setBusy(false);
    }
  }

  const reset = mode === "reset";
  return <form action={submit} className="account-form">
    <span className="account-badge"><ShieldCheck /> Licencia GIAN protegida</span>
    <h2>{mode === "register" ? "Creá tu cuenta profesional" : reset ? "Recuperá tu acceso" : "Ingresá a tu estudio"}</h2>
    <p>{mode === "register" ? "Creá tu cuenta con el código de activación único entregado por GIAN." : reset ? "Te enviaremos un enlace seguro al correo registrado." : "Ingresá con la cuenta particular de tu estudio."}</p>
    {mode === "register" && <label><span>Nombre y apellido</span><div><UserRound /><input name="fullName" required autoComplete="name" placeholder="Ej.: Dr. Juan Pérez" /></div></label>}
    <label><span>Correo electrónico</span><div><Mail /><input name="email" type="email" required autoComplete="email" placeholder="tu@estudio.com" /></div></label>
    <label><span>{reset ? "Nueva contraseña" : "Contraseña"}</span><div><LockKeyhole /><input name="password" type={show ? "text" : "password"} minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShow((value) => !value)} aria-label="Mostrar contraseña">{show ? <EyeOff /> : <Eye />}</button></div></label>
    {!reset && <label><span>Código de activación {mode === "login" && <small>(solo si la cuenta aún no fue activada)</small>}</span><div><KeyRound /><input name="activationCode" required={mode === "register"} autoComplete="off" placeholder="GIAN-XXXX-XXXX" /></div></label>}
    {reset && <p className="account-help">Por seguridad, abrí esta pantalla desde tu cuenta de ChatGPT y usá el mismo correo autenticado.</p>}
    {error && <p className="account-error">{error}</p>}
    <button className="account-submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}{busy ? "Procesando…" : mode === "register" ? "Crear cuenta e ingresar" : reset ? "Cambiar contraseña e ingresar" : "Ingresar"}</button>
    {mode === "login" && exists && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("reset"); }}>¿Olvidaste tu contraseña?</button>}
    {mode === "login" && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("register"); }}>Activar una licencia nueva</button>}
    {mode === "register" && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("login"); }}>Ya tengo una cuenta</button>}
    {reset && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("login"); }}>Volver al ingreso</button>}
    <p className="account-help">Las altas son exclusivamente por invitación. Solicitá tu licencia a GIAN Producciones Inteligentes.</p>
    {!exists && mode === "login" && <button type="button" className="account-switch" onClick={() => setMode("register")}>Crear la cuenta principal</button>}
  </form>;
}
