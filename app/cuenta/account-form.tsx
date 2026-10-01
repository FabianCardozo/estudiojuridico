"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

type Mode = "login" | "register" | "reset";

export default function AccountForm() {
  const [initialAccess, setInitialAccess] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [exists, setExists] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function unlockInitialAccess(fd: FormData) {
    const username = String(fd.get("initialUsername") || "").trim().toLowerCase();
    const password = String(fd.get("initialPassword") || "");
    if (username !== "admin" || password !== "admin") {
      setError("Usuario o contraseña inicial incorrectos.");
      return;
    }
    setError("");
    setInitialAccess(true);
  }

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
      const body = { fullName: fd.get("fullName"), email: fd.get("email"), password: fd.get("password") };
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({ error: "El servidor no pudo completar la operación." })) as { error?: string; requiresEmailConfirmation?: boolean; message?: string };
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
  if (!initialAccess) return <form action={unlockInitialAccess} className="account-form">
    <span className="account-badge"><LockKeyhole /> Acceso inicial</span>
    <h2>Ingresá a la aplicación</h2>
    <p>Usá las credenciales generales para continuar. Luego podrás ingresar o crear la cuenta particular de cada abogado.</p>
    <label><span>Usuario</span><div><UserRound /><input name="initialUsername" required autoComplete="username" placeholder="admin" /></div></label>
    <label><span>Contraseña</span><div><LockKeyhole /><input name="initialPassword" type={show ? "text" : "password"} required autoComplete="current-password" placeholder="admin" /><button type="button" onClick={() => setShow((value) => !value)} aria-label="Mostrar contraseña">{show ? <EyeOff /> : <Eye />}</button></div></label>
    {error && <p className="account-error">{error}</p>}
    <button className="account-submit"><ArrowRight />Continuar</button>
    <p className="account-help">Usuario inicial: <strong>admin</strong> · Contraseña inicial: <strong>admin</strong></p>
  </form>;

  return <form action={submit} className="account-form">
    <span className="account-badge"><LockKeyhole /> Acceso protegido</span>
    <h2>{mode === "register" ? "Creá tu cuenta profesional" : reset ? "Recuperá tu acceso" : "Ingresá a tu estudio"}</h2>
    <p>{mode === "register" ? "Cada abogado tendrá su espacio privado y su propio código QR." : reset ? "Te enviaremos un enlace seguro al correo registrado." : "Usá el correo y la contraseña particular del abogado."}</p>
    {mode === "register" && <label><span>Nombre y apellido</span><div><UserRound /><input name="fullName" required autoComplete="name" placeholder="Ej.: Dr. Juan Pérez" /></div></label>}
    <label><span>Correo electrónico</span><div><Mail /><input name="email" type="email" required autoComplete="email" placeholder="tu@estudio.com" /></div></label>
    <label><span>{reset ? "Nueva contraseña" : "Contraseña"}</span><div><LockKeyhole /><input name="password" type={show ? "text" : "password"} minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShow((value) => !value)} aria-label="Mostrar contraseña">{show ? <EyeOff /> : <Eye />}</button></div></label>
    {reset && <p className="account-help">Por seguridad, abrí esta pantalla desde tu cuenta de ChatGPT y usá el mismo correo autenticado.</p>}
    {error && <p className="account-error">{error}</p>}
    <button className="account-submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}{busy ? "Procesando…" : mode === "register" ? "Crear cuenta e ingresar" : reset ? "Cambiar contraseña e ingresar" : "Ingresar"}</button>
    {mode === "login" && exists && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("reset"); }}>¿Olvidaste tu contraseña?</button>}
    {mode === "login" && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("register"); }}>Crear una cuenta profesional nueva</button>}
    {mode === "register" && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("login"); }}>Ya tengo una cuenta</button>}
    {reset && <button type="button" className="account-switch" onClick={() => { setError(""); setMode("login"); }}>Volver al ingreso</button>}
    <button type="button" className="account-switch" onClick={() => { setError(""); setInitialAccess(false); }}>Volver al acceso inicial</button>
    {!exists && mode === "login" && <button type="button" className="account-switch" onClick={() => setMode("register")}>Crear la cuenta principal</button>}
  </form>;
}
