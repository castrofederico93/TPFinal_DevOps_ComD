import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

// Datos del preceptor logueado
export async function fetchPreceptorMe() {
  try {
    const data = await apiGet("/api/preceptores/me/datos");
    return data || null;
  } catch (err) {
    console.error("fetchPreceptorMe error", err);
    return null;
  }
}

// Comisiones asignadas al preceptor logueado
export async function fetchPreceptorComisiones() {
  try {
    const data = await apiGet("/api/preceptores/me/comisiones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorComisiones error", err);
    return [];
  }
}

// Métricas de alumnos (panel Alumnos)
export async function fetchPreceptorAlumnosMetrics() {
  try {
    const data = await apiGet("/api/preceptores/me/alumnos-metrics");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAlumnosMetrics error", err);
    return [];
  }
}

// Fechas con asistencia cargada para una comisión
export async function fetchPreceptorAsistenciaFechas(comisionId) {
  if (!comisionId) return [];
  try {
    const data = await apiGet(
      `/api/preceptores/me/asistencias/fechas?comisionId=${encodeURIComponent(
        comisionId
      )}`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAsistenciaFechas error", err);
    return [];
  }
}

// Lista de alumnos + estado de asistencia para una comisión y fecha
export async function fetchPreceptorAsistenciaLista(comisionId, fecha) {
  if (!comisionId || !fecha) return [];
  try {
    const data = await apiGet(
      `/api/preceptores/me/asistencias?comisionId=${encodeURIComponent(
        comisionId
      )}&fecha=${encodeURIComponent(fecha)}`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAsistenciaLista error", err);
    return [];
  }
}

// Guardar asistencia de una comisión y fecha
// payload: { comisionId, fecha, items: [{ alumnoId, estado }, ...] }
export async function savePreceptorAsistencia(payload) {
  try {
    await apiPost("/api/preceptores/me/asistencias", payload);
    return true;
  } catch (err) {
    console.error("savePreceptorAsistencia error", err);
    return false;
  }
}

// Notificaciones del preceptor logueado
export async function fetchPreceptorNotificaciones() {
  try {
    const data = await apiGet("/api/preceptores/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorNotificaciones error", err);
    return [];
  }
}

// Actualizar notificación (leída / favorita)
// fields: { leida?: boolean, favorito?: boolean }
export async function updatePreceptorNotificacion(id, fields = {}) {
  if (!id) return null;

  const payload = {};
  if (typeof fields.leida === "boolean") payload.leida = fields.leida;
  if (typeof fields.favorito === "boolean") payload.favorito = fields.favorito;

  if (Object.keys(payload).length === 0) return null;

  try {
    const data = await apiPatch(
      `/api/preceptores/me/notificaciones/${encodeURIComponent(id)}`,
      payload
    );
    return data || null;
  } catch (err) {
    console.error("updatePreceptorNotificacion error", err);
    return null;
  }
}

export async function deletePreceptorNotificacion(id) {
  try {
    await apiDelete(`/api/preceptores/me/notificaciones/${id}`);
    return true;
  } catch (err) {
    console.error("deletePreceptorNotificacion error", err);
    return false;
  }
}