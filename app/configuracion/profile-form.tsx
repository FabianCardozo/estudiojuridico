"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  LogOut,
  Save,
  Scale,
  Upload,
} from "lucide-react";
type P = {
  full_name: string;
  specialty: string;
  license_number?: string;
  phone?: string;
  email: string;
  address?: string;
  bio?: string;
  photo_key?: string;
};
export default function ProfileForm({ initial }: { initial: P }) {
  const [saved, setSaved] = useState(""),
    [photo, setPhoto] = useState(Boolean(initial.photo_key)),
    [photoVersion, setPhotoVersion] = useState(Date.now()),
    [preview, setPreview] = useState(""),
    [selectedFile, setSelectedFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [messageType, setMessageType] = useState<"ok" | "error">("ok");
  async function save(fd: FormData) {
    setSaved("Guardando…");
    const body = {
      fullName: fd.get("fullName"),
      specialty: fd.get("specialty"),
      licenseNumber: fd.get("licenseNumber"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      address: fd.get("address"),
      bio: fd.get("bio"),
    };
    const r = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessageType(r.ok ? "ok" : "error");
    setSaved(r.ok ? "Configuración guardada correctamente." : "No se pudieron guardar los datos.");
  }
  async function preparePhoto(event: ChangeEvent<HTMLInputElement>) {
    const original = event.target.files?.[0];
    if (!original) return;
    if (!original.type.startsWith("image/")) {
      setMessageType("error"); setSaved("Elegí una imagen JPG, PNG o WebP."); return;
    }
    const bitmap = await createImageBitmap(original);
    const scale = Math.min(1, 1200 / bitmap.width, 1600 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), "image/jpeg", .82));
    const optimized = new File([blob], "foto-profesional.jpg", { type: "image/jpeg" });
    setSelectedFile(optimized); setPreview(URL.createObjectURL(optimized));
    setMessageType("ok"); setSaved("Imagen lista. Presioná “Guardar imagen”.");
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) { setMessageType("error"); setSaved("Primero elegí una imagen."); return; }
    const fd = new FormData(); fd.set("photo", selectedFile);
    setBusy(true);
    setSaved("Subiendo imagen…");
    const r = await fetch("/api/profile/photo", { method: "POST", body: fd });
    const result = (await r.json().catch(() => ({ error: "No se pudo guardar la imagen." }))) as { error?: string };
    if (r.ok) {
      setPhoto(true);
      setPhotoVersion(Date.now());
      setPreview(""); setSelectedFile(null); setMessageType("ok");
      setSaved("Imagen guardada correctamente. Ya se utilizará en el panel y en el afiche A4.");
    } else { setMessageType("error"); setSaved(result.error || "No se pudo guardar la imagen."); }
    setBusy(false);
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/cuenta";
  }
  return (
    <main className="settings-page">
      <header>
        <a href="/">
          <ArrowLeft />
          Volver al panel
        </a>
        <button onClick={logout}>
          <LogOut />
          Cerrar sesión
        </button>
      </header>
      <section className="settings-title">
        <span>
          <Scale />
        </span>
        <div>
          <p>IDENTIDAD DEL ESTUDIO</p>
          <h1>{initial.full_name}</h1>
          <h2>Configuración profesional</h2>
          <small>
            Estos datos aparecerán en el panel, el formulario y el cartel del
            código QR.
          </small>
        </div>
      </section>
      <div className="settings-grid">
        <form onSubmit={upload} className="photo-card">
          <div className="photo-preview">
            {preview ? <img src={preview} alt="Vista previa de la foto" /> : photo ? (
              <img src={`/api/profile/photo?v=${photoVersion}`} alt="Foto profesional" />
            ) : (
              <Camera />
            )}
          </div>
          <h2>Imagen profesional</h2>
          <p>Usá una foto clara y vertical. Máximo 2 MB.</p>
          <label>
            <Upload />
            Elegir imagen
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={preparePhoto}
            />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar imagen"}</button>
        </form>
        <form action={save} className="profile-card">
          <div className="profile-fields">
            <label>
              Nombre profesional
              <input
                name="fullName"
                defaultValue={initial.full_name}
                required
              />
            </label>
            <label>
              Especialidad / actividad
              <input
                name="specialty"
                defaultValue={initial.specialty}
                placeholder="Ej.: Abogado penalista"
                required
              />
            </label>
            <label>
              Matrícula profesional
              <input
                name="licenseNumber"
                defaultValue={initial.license_number || ""}
              />
            </label>
            <label>
              Teléfono / WhatsApp
              <input name="phone" defaultValue={initial.phone || ""} />
            </label>
            <label>
              Correo electrónico
              <input
                name="email"
                type="email"
                defaultValue={initial.email}
                required
              />
            </label>
            <label>
              Dirección del estudio
              <input name="address" defaultValue={initial.address || ""} />
            </label>
            <label className="wide">
              Presentación breve
              <textarea
                name="bio"
                defaultValue={initial.bio || ""}
                rows={4}
                placeholder="Contá brevemente cómo trabajás y qué asuntos atendés."
              />
            </label>
          </div>
          <button className="save-profile">
            <Save />
            Guardar configuración
          </button>
          {saved && (
            <p className={`save-state ${messageType === "error" ? "error" : ""}`} role="status">
              <CheckCircle2 />
              {saved}
            </p>
          )}
        </form>
      </div>
      {saved && <div className={`action-toast ${messageType}`} role="status"><CheckCircle2 /><span>{saved}</span></div>}
    </main>
  );
}
