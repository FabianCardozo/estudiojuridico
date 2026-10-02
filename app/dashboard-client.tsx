"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gavel,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  X,
  Clock3,
  Scale,
  CalendarPlus,
  QrCode,
  Download,
  FileUp,
  FolderOpen,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Item = {
  id: string;
  title: string;
  sub: string;
  meta: string;
  status: string;
  date: string;
  amount?: number;
  paid?: number;
};
type Store = {
  clients: Item[];
  cases: Item[];
  agenda: Item[];
  tasks: Item[];
  docs: Item[];
  fees: Item[];
  comms: Item[];
};
type Profile = { fullName: string; specialty: string; hasPhoto: boolean };
type LegalDocument = { id:string; title:string; client_name:string; observations:string|null; active:number|boolean; case_id:string|null; case_title:string|null; file_name:string; file_type:string; file_size:number; created_at:number };
const seed: Store = {
  clients: [],
  cases: [],
  agenda: [],
  tasks: [],
  docs: [],
  fees: [],
  comms: [],
};
const tabs = [
  ["dashboard", "Panel", LayoutDashboard],
  ["clients", "Clientes", Users],
  ["cases", "Expedientes", BriefcaseBusiness],
  ["agenda", "Agenda", CalendarDays],
  ["tasks", "Tareas", CheckCircle2],
  ["docs", "Documentos", FileText],
  ["fees", "Honorarios", CircleDollarSign],
  ["comms", "Comunicaciones", MessageSquare],
  ["reports", "Reportes", Gavel],
] as const;
const labels: any = {
  clients: ["Clientes", "Nuevo cliente"],
  cases: ["Expedientes", "Nuevo expediente"],
  agenda: ["Agenda jurídica", "Nueva fecha"],
  tasks: ["Tareas", "Nueva tarea"],
  docs: ["Documentos y modelos", "Registrar documento"],
  fees: ["Honorarios y gastos", "Nuevo movimiento"],
  comms: ["Comunicaciones y consultas", "Registrar contacto"],
};
const fmt = (d: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(d + "T12:00:00Z"));
const cash = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

export default function DashboardClient({ profile }: { profile: Profile }) {
  const [store, setStore] = useState(seed),
    [view, setView] = useState("dashboard"),
    [q, setQ] = useState(""),
    [menu, setMenu] = useState(false),
    [modal, setModal] = useState(false),
    [sync, setSync] = useState("Cargando…"),
    [newRequests, setNewRequests] = useState(0),
    [toast, setToast] = useState(""),
    [documents, setDocuments] = useState<LegalDocument[]>([]),
    [caseUpload, setCaseUpload] = useState<Item | null>(null);
  const firstLoad = useRef(true),
    audioReady = useRef(false),
    lastRequestRef = useRef(0);
  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => r.json() as Promise<{ data?: Store }>)
      .then((r) => {
        if (r.data) setStore(r.data);
        setSync("Guardado");
      })
      .catch(() => setSync("Sin conexión"));
  }, []);
  const loadDocuments = () => fetch("/api/documents").then((r) => r.json() as Promise<{items?:LegalDocument[]}>).then((r) => setDocuments(r.items || []));
  useEffect(() => { loadDocuments().catch(() => undefined); }, []);
  useEffect(() => {
    if (sync === "Cargando…") return;
    const t = setTimeout(() => {
      setSync("Guardando…");
      fetch("/api/workspace", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: store }),
      })
        .then((r) => setSync(r.ok ? "Guardado" : "Sin conexión"))
        .catch(() => setSync("Sin conexión"));
    }, 700);
    return () => clearTimeout(t);
  }, [store]);
  useEffect(() => {
    const unlock = () => {
      audioReady.current = true;
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
  useEffect(() => {
    async function check() {
      const r = await fetch("/api/prospects");
      if (!r.ok) return;
      const j = (await r.json()) as {
        items?: Array<{
          created_at: number;
          status: string;
          first_name: string;
          last_name: string;
        }>;
      };
      const items = j.items || [];
      const latest = items[0]?.created_at || 0;
      const seen = Number(localStorage.getItem("legal-last-request") || 0);
      const count = items.filter(
        (x: any) => x.status === "Nueva" && x.created_at > seen,
      ).length;
      setNewRequests(count);
      if (latest > lastRequestRef.current) {
        lastRequestRef.current = latest;
        fetch("/api/workspace")
          .then((r) => r.json() as Promise<{ data?: Store }>)
          .then((r) => {
            if (r.data) setStore(r.data);
          });
      }
      if (!firstLoad.current && count > 0 && latest > seen) {
        setToast(
          `Nueva solicitud de ${items[0].first_name} ${items[0].last_name}`,
        );
        if (audioReady.current) chime();
      }
      firstLoad.current = false;
    }
    check();
    const id = setInterval(check, 12000);
    return () => clearInterval(id);
  }, []);
  const debt = store.fees.reduce(
      (a, x) => a + (x.amount || 0) - (x.paid || 0),
      0,
    ),
    list = (store as any)[view] as Item[] | undefined;
  const filtered = useMemo(
    () =>
      list?.filter((x) =>
        (x.title + x.sub + x.meta + x.status)
          .toLowerCase()
          .includes(q.toLowerCase()),
      ) || [],
    [list, q],
  );
  const filteredDocuments = useMemo(() => documents.filter((x) => `${x.title} ${x.client_name} ${x.case_title || ""} ${x.observations || ""} ${x.file_name}`.toLowerCase().includes(q.toLowerCase())), [documents, q]);
  function selectView(id: string) {
    setView(id);
    setMenu(false);
    if (id === "clients" && newRequests) {
      localStorage.setItem("legal-last-request", String(Date.now()));
      setNewRequests(0);
      setToast("");
    }
  }
  async function add(fd: FormData) {
    if (view === "docs" || caseUpload) {
      setSync("Subiendo documento…");
      const response = await fetch("/api/documents", { method: "POST", body: fd });
      const result = await response.json().catch(() => ({ error: "No se pudo cargar el documento." })) as { error?: string };
      if (!response.ok) { setSync(result.error || "Error al cargar"); return; }
      await loadDocuments(); setModal(false); setCaseUpload(null); setSync("Documento guardado"); return;
    }
    if (!list) return;
    const title = String(fd.get("title") || "").trim();
    if (!title) return;
    const x: Item = {
      id: crypto.randomUUID(),
      title,
      sub: String(fd.get("sub") || "Sin asociar"),
      meta: String(fd.get("meta") || "Registro creado manualmente"),
      status:
        view === "tasks"
          ? "Pendiente"
          : view === "fees"
            ? "Pendiente"
            : "Activo",
      date: String(fd.get("date") || new Date().toISOString().slice(0, 10)),
      ...(view === "fees"
        ? {
            amount: Number(fd.get("amount") || 0),
            paid: Number(fd.get("paid") || 0),
          }
        : {}),
    };
    setStore((s) => ({ ...s, [view]: [x, ...(s as any)[view]] }));
    setModal(false);
  }
  function next(x: Item) {
    if (view !== "tasks") return;
    const status =
      x.status === "Pendiente"
        ? "En proceso"
        : x.status === "En proceso"
          ? "Terminada"
          : "Pendiente";
    setStore((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === x.id ? { ...t, status } : t)),
    }));
  }
  const title = tabs.find((x) => x[0] === view)?.[1];
  return (
    <div className="shell">
      <aside className={menu ? "side open" : "side"}>
        <div className="brand">
          <i>
            <Scale />
          </i>
          <b>
            Centro de Gestión<span>Jurídica</span>
          </b>
          <button onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button
              className={view === id ? "active" : ""}
              onClick={() => selectView(id)}
              key={id}
            >
              <Icon />
              <span>{label}</span>
              {id === "clients" && newRequests > 0 && <em>{newRequests}</em>}
              {id === "tasks" && (
                <em>
                  {store.tasks.filter((x) => x.status !== "Terminada").length}
                </em>
              )}
            </button>
          ))}
          <a href="/solicitudes" className="prospect-link">
            <CalendarPlus />
            <span>Solicitudes</span>
            {newRequests > 0 && <em>{newRequests}</em>}
          </a>
          <a href="/qr-turnos" className="prospect-link">
            <QrCode />
            <span>Código QR</span>
          </a>
        </nav>
        <footer>
          <a href="/configuracion" className="side-settings">
            <Settings />
            <span>Configuración</span>
          </a>
          <div className="user">
            {profile.hasPhoto ? (
              <img src="/api/profile/photo" alt="Foto profesional" />
            ) : (
              <i>{initials(profile.fullName)}</i>
            )}
            <p>
              <b>{profile.fullName}</b>
              <small>{profile.specialty}</small>
            </p>
          </div>
          <div className="gian">
            Desarrollado por <b>GIAN</b>
            <span>Producciones Inteligentes</span>
          </div>
        </footer>
      </aside>
      {menu && <button className="scrim" onClick={() => setMenu(false)} />}
      <main>
        <header>
          <button className="hamb" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div className="lawyer-heading">
            <small>{title}</small>
            <h1>{profile.fullName}</h1>
            <span>{profile.specialty}</span>
          </div>
          <label className="search">
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar…"
            />
          </label>
          <span className="saved">
            <i />
            {sync}
          </span>
          {profile.hasPhoto ? (
            <img className="avatar-photo" src="/api/profile/photo" alt="" />
          ) : (
            <b className="avatar">{initials(profile.fullName)}</b>
          )}
        </header>
        {toast && (
          <button
            className="request-toast"
            onClick={() => (location.href = "/solicitudes")}
          >
            <Bell />
            <span>
              <b>{toast}</b>
              <small>Hacé clic para revisar y agendar</small>
            </span>
            <ChevronRight />
          </button>
        )}
        <section className="content">
          {view === "dashboard" ? (
            <Dashboard
              store={store}
              debt={debt}
              name={profile.fullName}
              newRequests={newRequests}
              go={selectView}
            />
          ) : view === "reports" ? (
            <Reports store={store} debt={debt} />
          ) : (
            <>
              <div className="heading">
                <div>
                  <h2>{labels[view][0]}</h2>
                  <p>{view === "docs" ? filteredDocuments.length : filtered.length} registros · más recientes primero</p>
                </div>
                <Button onClick={() => setModal(true)}>
                  <Plus />
                  {labels[view][1]}
                </Button>
              </div>
              {view === "docs" ? (
                <DocumentsPanel items={filteredDocuments} reload={loadDocuments} />
              ) : view === "cases" ? (
                <CasesPanel items={filtered} documents={documents} onAttach={(item) => { setCaseUpload(item); setModal(true); }} />
              ) : view === "tasks" ? (
                <div className="kanban">
                  {["Pendiente", "En proceso", "Terminada"].map((s) => (
                    <section key={s}>
                      <h3>
                        {s}
                        <span>
                          {store.tasks.filter((x) => x.status === s).length}
                        </span>
                      </h3>
                      {filtered
                        .filter((x) => x.status === s)
                        .map((x) => (
                          <Card x={x} key={x.id} onClick={() => next(x)} />
                        ))}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="table">
                  <div className="thead">
                    <b>Registro</b>
                    <b>Estado</b>
                    <b>Fecha / importe</b>
                  </div>
                  {filtered.map((x) => (
                    <div className="row" key={x.id}>
                      <span className="kind">
                        {view === "clients" ? initials(x.title) : <FileText />}
                      </span>
                      <div>
                        <b>{x.title}</b>
                        <p>{x.sub}</p>
                        <small>{x.meta}</small>
                      </div>
                      <em>{x.status}</em>
                      <strong>
                        {view === "fees"
                          ? cash((x.amount || 0) - (x.paid || 0))
                          : fmt(x.date)}
                      </strong>
                      <ChevronRight />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <NewDialog
        open={modal}
        close={() => { setModal(false); setCaseUpload(null); }}
        save={add}
        view={view}
        caseContext={caseUpload}
      />
    </div>
  );
}
function initials(name: string) {
  return name
    .replace(/^(Dr\.?|Dra\.?)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function chime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880, 1040].forEach((freq, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(
        0.16,
        ctx.currentTime + i * 0.12 + 0.02,
      );
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + i * 0.12 + 0.18,
      );
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  } catch {}
}
function Dashboard({
  store,
  debt,
  name,
  newRequests,
  go,
}: {
  store: Store;
  debt: number;
  name: string;
  newRequests: number;
  go: (x: string) => void;
}) {
  return (
    <>
      <div className="welcome">
        <div>
          <span>Centro de control</span>
          <h2>
            Buen día, {name.replace(/^(Dr\.?|Dra\.?)\s*/i, "").split(" ")[0]}
          </h2>
          <p>
            {newRequests > 0 ? (
              <>
                <b>
                  Tenés {newRequests} solicitud{newRequests > 1 ? "es" : ""}{" "}
                  nueva{newRequests > 1 ? "s" : ""}.
                </b>{" "}
                Revisalas para confirmar una entrevista.
              </>
            ) : (
              "Tu estudio está actualizado y listo para trabajar."
            )}
          </p>
        </div>
        <a
          href="/solicitudes"
          className={`new-request-signal ${newRequests > 0 ? "has-new" : ""}`}
        >
          <Bell />
          {newRequests > 0
            ? `${newRequests} solicitud${newRequests > 1 ? "es" : ""} nueva${newRequests > 1 ? "s" : ""}`
            : "Sin solicitudes nuevas"}
        </a>
      </div>
      <div className="metrics">
        <Metric
          icon={Users}
          label="Clientes"
          value={store.clients.length}
          tone="blue"
          go={() => go("clients")}
        />
        <Metric
          icon={Bell}
          label="Solicitudes nuevas"
          value={newRequests}
          tone="red"
          go={() => (location.href = "/solicitudes")}
        />
        <Metric
          icon={BriefcaseBusiness}
          label="Expedientes activos"
          value={store.cases.length}
          tone="amber"
          go={() => go("cases")}
        />
        <Metric
          icon={CircleDollarSign}
          label="Honorarios pendientes"
          value={cash(debt)}
          tone="green"
          go={() => go("fees")}
        />
      </div>
      <div className="dashgrid">
        <Panel
          title="Agenda inmediata"
          go={() => go("agenda")}
          items={store.agenda}
        />
        <Panel
          title="Clientes recientes"
          go={() => go("clients")}
          items={store.clients}
        />
      </div>
    </>
  );
}
function Metric({ icon: Icon, label, value, tone, go }: any) {
  return (
    <button className={`metric ${tone}`} onClick={go}>
      <i>
        <Icon />
      </i>
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
      <ChevronRight />
    </button>
  );
}
function Panel({
  title,
  go,
  items,
}: {
  title: string;
  go: () => void;
  items: Item[];
}) {
  return (
    <section className="panel">
      <header>
        <div>
          <h3>{title}</h3>
          <p>Información reciente</p>
        </div>
        <button onClick={go}>Ver todos</button>
      </header>
      {items.length ? (
        items.slice(0, 4).map((x) => (
          <div className="mini" key={x.id}>
            <time>
              <b>{new Date(x.date + "T12:00:00Z").getUTCDate()}</b>
              <small>
                {new Date(x.date + "T12:00:00Z").toLocaleString("es-AR", {
                  month: "short",
                  timeZone: "UTC",
                })}
              </small>
            </time>
            <div>
              <b>{x.title}</b>
              <p>{x.sub}</p>
              <small>{x.status}</small>
            </div>
            <ChevronRight />
          </div>
        ))
      ) : (
        <p className="empty-panel">Todavía no hay registros.</p>
      )}
    </section>
  );
}
function Card({ x, onClick }: { x: Item; onClick: () => void }) {
  return (
    <article className="task">
      <span>{x.meta}</span>
      <b>{x.title}</b>
      <p>{x.sub}</p>
      <small>Vence {fmt(x.date)}</small>
      <Button variant="outline" size="sm" onClick={onClick}>
        Cambiar estado
      </Button>
    </article>
  );
}
function DocumentsPanel({ items, reload }: { items: LegalDocument[]; reload: () => Promise<void> }) {
  async function toggle(item: LegalDocument) {
    await fetch("/api/documents", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({id:item.id,active:!Boolean(item.active)}) });
    await reload();
  }
  return <div className="documents-list">
    {items.length ? items.map((item) => <article className="document-card" key={item.id}>
      <span className="document-icon"><FileText /></span>
      <div className="document-info"><div><h3>{item.title}</h3><em className={item.active ? "active" : "inactive"}>{item.active ? "Activo" : "Inactivo"}</em></div><b>Cliente: {item.client_name}</b>{item.case_title && <span className="document-case"><BriefcaseBusiness /> Expediente: {item.case_title}</span>}<p>{item.observations || "Sin observaciones"}</p><small>{item.file_name} · {(item.file_size/1024/1024).toFixed(2)} MB · Cargado {new Intl.DateTimeFormat("es-AR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</small></div>
      <div className="document-actions"><a href={`/api/documents/${item.id}`}><Download /> Descargar</a><button type="button" onClick={() => toggle(item)}>{item.active ? "Marcar inactivo" : "Marcar activo"}</button></div>
    </article>) : <div className="documents-empty"><FileUp/><h3>Todavía no hay documentos</h3><p>Cargá archivos PDF o Word y vinculalos con un cliente.</p></div>}
  </div>;
}
function CasesPanel({ items, documents, onAttach }: { items: Item[]; documents: LegalDocument[]; onAttach: (item: Item) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <div className="cases-list">
    {items.length ? items.map((item) => {
      const files = documents.filter((doc) => doc.case_id === item.id);
      const open = openId === item.id;
      return <article className="case-card" key={item.id}>
        <div className="case-summary">
          <span className="case-icon"><BriefcaseBusiness /></span>
          <div><h3>{item.title}</h3><p>{item.sub}</p><small>{item.meta} · {fmt(item.date)}</small></div>
          <em>{item.status}</em>
          <strong><Paperclip /> {files.length} archivo{files.length === 1 ? "" : "s"}</strong>
          <div className="case-actions"><button type="button" onClick={() => onAttach(item)}><FileUp /> Adjuntar</button><button type="button" onClick={() => setOpenId(open ? null : item.id)}><FolderOpen /> {open ? "Ocultar" : "Ver archivos"}</button></div>
        </div>
        {open && <div className="case-files">{files.length ? files.map((doc) => <div key={doc.id}><FileText /><span><b>{doc.title}</b><small>{doc.file_name} · {new Intl.DateTimeFormat("es-AR",{dateStyle:"medium"}).format(new Date(doc.created_at))}</small></span><a href={`/api/documents/${doc.id}`}><Download /> Descargar</a></div>) : <p>Este expediente todavía no tiene documentos adjuntos.</p>}</div>}
      </article>;
    }) : <div className="documents-empty"><BriefcaseBusiness/><h3>Todavía no hay expedientes</h3><p>Creá un expediente y luego podrás adjuntar sus documentos.</p></div>}
  </div>;
}
function Reports({ store, debt }: { store: Store; debt: number }) {
  return (
    <>
      <div className="heading">
        <div>
          <h2>Reportes</h2>
          <p>Indicadores centrales del estudio</p>
        </div>
      </div>
      <div className="reportgrid">
        <Report t="Causas activas" v={store.cases.length} />
        <Report
          t="Tareas abiertas"
          v={store.tasks.filter((x) => x.status !== "Terminada").length}
        />
        <Report
          t="Próximas audiencias"
          v={store.agenda.filter((x) => x.status === "Audiencia").length}
        />
        <Report t="Honorarios pendientes" v={cash(debt)} />
      </div>
    </>
  );
}
function Report({ t, v }: { t: string; v: string | number }) {
  return (
    <div className="report">
      <small>{t}</small>
      <b>{v}</b>
      <span>Información registrada</span>
    </div>
  );
}
function NewDialog({
  open,
  close,
  save,
  view,
  caseContext,
}: {
  open: boolean;
  close: () => void;
  save: (x: FormData) => void;
  view: string;
  caseContext: Item | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(x) => !x && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{caseContext ? "Adjuntar documento al expediente" : "Nuevo registro"}</DialogTitle>
          <DialogDescription>{caseContext ? "El archivo también quedará disponible en la sección Documentos." : "Completá los datos principales."}</DialogDescription>
        </DialogHeader>
        <form action={save} className="form">
          {view === "docs" || caseContext ? <>
            {caseContext && <div className="case-upload-context"><BriefcaseBusiness /><span><small>Documento para el expediente</small><b>{caseContext.title}</b></span></div>}
            {caseContext && <><input type="hidden" name="caseId" value={caseContext.id}/><input type="hidden" name="caseTitle" value={caseContext.title}/></>}
            <label>Título del documento<Input name="title" required autoFocus placeholder="Ej.: Demanda laboral" /></label>
            <label>Nombre del cliente<Input name="clientName" required defaultValue={caseContext?.sub || ""} placeholder="Apellido y nombre" /></label>
            <label className="wide">Archivo PDF o Word<input className="document-file-input" name="file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label>
            <label className="wide">Observaciones<textarea name="observations" rows={4} placeholder="Notas, relación con el expediente o información relevante" /></label>
            <label className="document-active"><input name="active" type="checkbox" defaultChecked /> Documento activo</label>
          </> : <>
          <label>
            Título / nombre
            <Input name="title" required autoFocus />
          </label>
          <label>
            Expediente, cliente o referencia
            <Input name="sub" />
          </label>
          <label>
            Detalle
            <Input name="meta" />
          </label>
          <label>
            Fecha
            <Input name="date" type="date" />
          </label>
          {view === "fees" && (
            <>
              <label>
                Importe
                <Input name="amount" type="number" />
              </label>
              <label>
                Pagado
                <Input name="paid" type="number" />
              </label>
            </>
          )}
          </>}
          <div>
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit">Guardar registro</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
