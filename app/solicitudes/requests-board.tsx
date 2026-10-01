"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  Clock3,
  ExternalLink,
  MessageCircle,
  QrCode,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type RequestItem = {
  id: string;
  first_name: string;
  last_name: string;
  document: string | null;
  phone: string;
  email: string | null;
  preferred_channel: string;
  interview_mode: string;
  reason: string;
  preferred_time: string | null;
  preferred_date: string | null;
  preferred_hour: string | null;
  urgency: string;
  status: string;
  appointment_at: string | null;
  internal_note: string | null;
  created_at: number;
};
const states = [
  "Nueva",
  "En revisión",
  "Contactada",
  "Confirmada",
  "Rechazada",
  "Cancelada",
];
export default function RequestsBoard({
  lawyerName,
  specialty,
  bookingCode,
}: {
  lawyerName: string;
  specialty: string;
  bookingCode: string;
}) {
  const publicForm = `/solicitar?codigo=${bookingCode}`;
  const [items, setItems] = useState<RequestItem[]>([]),
    [loading, setLoading] = useState(true),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("Activas"),
    [selected, setSelected] = useState<RequestItem | null>(null),
    [notice, setNotice] = useState("");
  const load = () => {
    setLoading(true);
    fetch("/api/prospects")
      .then((r) => r.json() as Promise<{ items?: RequestItem[] }>)
      .then((j) => setItems(j.items || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const visible = useMemo(
    () =>
      items.filter(
        (x) =>
          (filter === "Todas" ||
            (filter === "Activas"
              ? !["Cancelada", "Rechazada"].includes(x.status)
              : x.status === filter)) &&
          (x.first_name + x.last_name + x.phone + x.reason)
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [items, q, filter],
  );
  async function save(fd: FormData) {
    if (!selected) return;
    const body = {
      id: selected.id,
      status: String(fd.get("status")),
      appointmentAt: String(fd.get("appointmentAt") || ""),
      internalNote: String(fd.get("internalNote") || ""),
    };
    const r = await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await r.json().catch(() => ({}))) as { error?: string };
    if (r.ok) {
      setNotice(body.status === "Confirmada" ? "Entrevista guardada en la Agenda" : "Solicitud actualizada correctamente");
      setSelected(null);
      load();
    } else {
      setNotice(result.error || "No se pudo actualizar la solicitud");
    }
  }
  async function reject(x: RequestItem) {
    if (!window.confirm(`¿Marcar como no aceptada la solicitud de ${x.first_name} ${x.last_name}?`)) return;
    const r = await fetch("/api/prospects", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: x.id, status: "Rechazada", appointmentAt: "", internalNote: x.internal_note || "Solicitud no aceptada" }) });
    setNotice(r.ok ? "Solicitud marcada como no aceptada" : "No se pudo actualizar la solicitud");
    if (r.ok) load();
  }
  function whatsapp(x: RequestItem) {
    const date = x.appointment_at
      ? new Intl.DateTimeFormat("es-AR", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(new Date(x.appointment_at))
      : "el día y horario que acordemos";
    const msg = x.appointment_at
      ? `Hola ${x.first_name}. Te escribimos del estudio jurídico para confirmar tu entrevista ${x.interview_mode.toLowerCase()} para ${date}. Por favor, respondé este mensaje para confirmar tu asistencia.`
      : `Hola ${x.first_name}. Recibimos tu solicitud de entrevista con el estudio jurídico. Nos comunicamos para acordar el día y el horario. Tu disponibilidad propuesta fue ${formatDate(x.preferred_date)} a las ${x.preferred_hour || "hora a convenir"}.`;
    return `https://wa.me/${x.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  }
  return (
    <main className="requests-page">
      <header className="requests-header">
        <a href="/">
          <ArrowLeft />
          Volver al panel
        </a>
        <div>
          <a href="/qr-turnos">
            <QrCode />
            Ver código QR
          </a>
          <a href={publicForm} target="_blank" rel="noreferrer">
            <ExternalLink />
            Probar formulario
          </a>
          <button onClick={load}>
            <RefreshCw />
            Actualizar
          </button>
        </div>
      </header>
      <section className="requests-content">
        <div className="requests-title">
          <div>
            <span>{specialty}</span>
            <h1>{lawyerName}</h1>
            <h2>Solicitudes de entrevista</h2>
            <p>
              Las solicitudes más recientes aparecen primero y se agregan
              automáticamente a Clientes.
            </p>
          </div>
          <strong>
            <b>{items.filter((x) => x.status === "Nueva").length}</b>Nuevas
          </strong>
        </div>
        <div className="requests-tools">
          <label>
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, celular o motivo…"
            />
          </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Activas</option>
            <option>Todas</option>
            {states.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <a href="/qr-turnos" className="requests-qr">
            <img src="/qr-solicitar-turno.png" alt="QR del formulario" />
            <span>
              <b>QR personalizado</b>
              <small>Ver, imprimir o descargar</small>
            </span>
          </a>
        </div>
        {notice && <p className="requests-notice">{notice}</p>}
        {loading ? (
          <div className="requests-empty">Cargando solicitudes…</div>
        ) : visible.length === 0 ? (
          <div className="requests-empty">
            <Users />
            <h2>No hay solicitudes en esta vista</h2>
          </div>
        ) : (
          <div className="requests-list">
            {visible.map((x) => (
              <article key={x.id}>
                <div>
                  <div className="request-name">
                    <h2>
                      {x.first_name} {x.last_name}
                    </h2>
                    <span>{x.status}</span>
                    {x.urgency !== "Normal" && <em>{x.urgency}</em>}
                  </div>
                  <p>
                    {x.phone}
                    {x.email ? ` · ${x.email}` : ""}
                  </p>
                  <small>
                    Prefiere {x.preferred_channel} · Entrevista{" "}
                    {x.interview_mode.toLowerCase()}
                  </small>
                  <div className="proposed-time">
                    <Clock3 />
                    <span>
                      <b>Fecha propuesta</b>
                      {formatDate(x.preferred_date)} ·{" "}
                      {x.preferred_hour || "Sin horario"}
                    </span>
                  </div>
                </div>
                <div className="request-reason">
                  <p>{x.reason}</p>
                  {x.preferred_time && (
                    <small>Otra disponibilidad: {x.preferred_time}</small>
                  )}
                  <time>
                    Recibida:{" "}
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(x.created_at))}
                  </time>
                </div>
                <div className="request-actions">
                  <Button onClick={() => setSelected(x)}>
                    <CalendarCheck />
                    Agendar
                  </Button>
                  <a href={whatsapp(x)} target="_blank" rel="noreferrer">
                    <Button variant="outline">
                      <MessageCircle />
                      WhatsApp
                    </Button>
                  </a>
                  <Button variant="outline" onClick={() => reject(x)}>
                    <XCircle />
                    No aceptar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {selected && (
        <div
          className="request-modal"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setSelected(null);
          }}
        >
          <form action={save}>
            <h2>
              Agendar a {selected.first_name} {selected.last_name}
            </h2>
            <p>
              La persona propuso {formatDate(selected.preferred_date)} a las{" "}
              {selected.preferred_hour || "--:--"}.
            </p>
            <label>
              Fecha y hora confirmadas
              <Input
                name="appointmentAt"
                type="datetime-local"
                defaultValue={
                  selected.appointment_at ||
                  `${selected.preferred_date || ""}T${selected.preferred_hour || ""}`
                }
              />
            </label>
            <label>
              Estado
              <select name="status" defaultValue={selected.status === "Nueva" || selected.status === "Contactada" ? "Confirmada" : selected.status}>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Nota interna
              <textarea
                name="internalNote"
                defaultValue={selected.internal_note || ""}
                rows={3}
              />
            </label>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Confirmar y guardar en Agenda</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
}
