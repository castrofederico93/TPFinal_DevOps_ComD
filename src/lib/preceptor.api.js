// src/lib/preceptor.api.js
// Adapter único para la vista de Preceptor: JSON (legacy) ⇄ API (nueva).
// Expone funciones puras y una forma de datos estable para el UI.

// Toggle: usar API si VITE_USE_API_PRECEPTOR es truthy.
const USE_API =
  String(import.meta.env?.VITE_USE_API_PRECEPTOR || "").toLowerCase() === "true" ||
  import.meta.env?.VITE_USE_API_PRECEPTOR === true;

// Endpoints base
const BASE = (import.meta.env?.VITE_API_URL || "").replace(/\/+$/, "");

// apiFetch: wrapper mínimo; intenta usar ../lib/api si existe.
let apiFetch = null;
try {
  // eslint-disable-next-line import/no-relative-packages
  ({ apiFetch } = await import("../lib/api"));
} catch {
  apiFetch = async (path, opts = {}) => {
    const { method = "GET", body, headers = {}, token = localStorage.getItem("token") || null, signal } = opts;
    const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await res.text();
    const data = safeJson(txt);
    if (!res.ok) {
      const msg = typeof data === "string" ? data : data?.error || "Error";
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return typeof data === "string" ? { message: data } : data;
  };
}

function safeJson(x) {
  try {
    return JSON.parse(x);
  } catch {
    return x;
  }
}

// ===== Helpers de mapeo
const parseComisionId = (comisionId = "") => {
  const [materiaCodigo, letra] = String(comisionId).split("_");
  return { materiaCodigo, letra };
};

const toFrontComision = (row) => {
  // row (API): { id, codigo, letra, horario, cupo, estado, sede, aula, materia:{ codigo, nombre }, docente_id? }
  // row (JSON): derivado desde materias.json: { id(materiaCodigo), comision(letra), nombre, ... }
  if (row?.materia?.codigo && row?.letra) {
    return {
      id: `${row.materia.codigo}_${row.letra}`,
      materiaId: row.materia.codigo,
      comision: row.letra,
      nombreMateria: row.materia.nombre,
      docenteId: row.docente_id ?? null,
      horario: row.horario ?? "A confirmar",
      sede: row.sede ?? "Central",
      aula: row.aula ?? "A confirmar",
      estado: row.estado ?? "En curso",
      dbId: row.id, // útil para futuras llamadas por ID numérico
    };
  }
  // Fallback JSON "materia expandida"
  return {
    id: `${row.id}_${row.comision}`,
    materiaId: row.id,
    comision: row.comision,
    nombreMateria: row.nombre,
    docenteId: row.docenteId ?? null,
    horario: row.horario ?? "A confirmar",
    sede: row.sede ?? "Central",
    aula: row.aula ?? "A confirmar",
    estado: row.estado ?? "En curso",
    dbId: null,
  };
};

// ===== Fallback JSON (legacy)
let JSON_CACHE = null;
async function loadLegacyJson() {
  if (JSON_CACHE) return JSON_CACHE;
  // Imports estáticos para tree-shaking de Vite
  const [alumnos, materias, califs, asistencias] = await Promise.all([
    import("../data/alumnos.json"),
    import("../data/materias.json"),
    import("../data/calificaciones.json"),
    import("../data/asistencias.json"),
  ]);
  JSON_CACHE = {
    alumnos: alumnos.default || alumnos,
    materias: materias.default || materias,
    califs: califs.default || califs,
    asistencias: asistencias.default || asistencias,
  };
  return JSON_CACHE;
}

// ===== API pública del adapter =====

// Perfil básico del preceptor autenticado
export async function getMe() {
  if (USE_API) {
    return apiFetch("/api/preceptores/me/datos");
  }
  // Legacy: simula mínimos desde localStorage/placeholder
  return {
    id: Number(localStorage.getItem("userId") || 1000),
    nombre: localStorage.getItem("displayName") || "Preceptor/a",
    apellido: "",
    usuario_id: Number(localStorage.getItem("userId") || 1000),
  };
}

// Comisiones asignadas al preceptor
export async function getMyComisiones() {
  if (USE_API) {
    const rows = await apiFetch("/api/preceptores/me/comisiones");
    return rows.map(toFrontComision);
  }
  const { materias } = await loadLegacyJson();
  // Deriva comisiones desde materias.json
  return (materias || []).map(toFrontComision);
}

// Alumnos de una comisión (lectura)
export async function listAlumnosByComision(comisionId, { page = 1, size = 200, query = "" } = {}) {
  if (USE_API) {
    // Endpoint propuesto para etapa 1.1 (cuando esté listo):
    // return apiFetch(`/api/preceptores/comisiones/${dbId}/alumnos?page=${page}&size=${size}&query=${encodeURIComponent(query)}`);
    // Mientras no exista en API, mantenemos fallback JSON:
  }
  const { alumnos, califs } = await loadLegacyJson();
  const { materiaCodigo, letra } = parseComisionId(comisionId);
  const ids = new Set(
    (califs || [])
      .filter((r) => r.materiaId === materiaCodigo && r.comision === letra)
      .map((r) => r.alumnoId)
  );
  let items = (alumnos || [])
    .filter((a) => ids.has(a.id))
    .map((a) => ({ id: a.id, apellido: a.apellido || "-", nombre: a.nombre || "-", dni: a.dni || "-" }));
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (a) =>
        String(a.id).includes(q) ||
        (a.dni && String(a.dni).includes(q)) ||
        `${a.apellido} ${a.nombre}`.toLowerCase().includes(q)
    );
  }
  const total = items.length;
  const start = (page - 1) * size;
  const pageItems = items.slice(start, start + size);
  return { items: pageItems, page, size, total };
}

// Asistencias por comisión+fecha (lectura)
export async function getAsistencias(comisionId, fechaISO) {
  if (USE_API) {
    // Endpoint propuesto para etapa 1.2 (cuando esté listo):
    // return apiFetch(`/api/preceptores/asistencias?comision_id=${dbId}&fecha=${encodeURIComponent(fechaISO)}`);
    // Fallback JSON mientras tanto:
  }
  const { asistencias } = await loadLegacyJson();
  const { materiaCodigo, letra } = parseComisionId(comisionId);
  const rows = (asistencias || []).filter(
    (r) => r.materiaId === materiaCodigo && r.comision === letra && r.fecha === fechaISO
  );
  // Normalizado
  return rows.map((r) => ({ alumnoId: r.alumnoId, estado: r.estado || "" }));
}

// Guardado en lote de asistencias (escritura)
export async function saveAsistenciasBulk(comisionId, fechaISO, items) {
  if (USE_API) {
    // Endpoint de etapa 2:
    // const dbId = await resolveComisionDbId(comisionId);
    // return apiFetch("/api/preceptores/asistencias/bulk", { method: "PUT", body: { comision_id: dbId, fecha: fechaISO, items } });
    throw new Error("Endpoint de API no disponible aún");
  }
  // En legacy el guardado lo maneja el componente (estado/LS); aquí no hacemos nada.
  return { updated: 0, mode: "legacy" };
}

// Resolución opcional: mapear "MAT-1_A" → ID numérico de DB (cuando exista un endpoint de lookup)
export async function resolveComisionDbId(/* comisionId */) {
  // Placeholder para etapa API pura.
  return null;
}

// Exponer si estamos usando API (útil para toggles en UI)
export function isPreceptorApiEnabled() {
  return USE_API;
}