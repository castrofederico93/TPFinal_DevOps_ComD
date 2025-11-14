import { apiGet } from "./api";

// Datos básicos del usuario logueado (si quisieras usarlos)
export async function fetchPreceptorMe() {
  try {
    const data = await apiGet("/api/auth/me");
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

// Métricas de alumnos (lo que usa el panel Alumnos)
export async function fetchPreceptorAlumnosMetrics() {
  try {
    const data = await apiGet("/api/preceptores/me/alumnos-metrics");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAlumnosMetrics error", err);
    return [];
  }
}