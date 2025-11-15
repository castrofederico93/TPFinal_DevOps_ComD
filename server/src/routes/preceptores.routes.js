import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import {
  getPreceptorDatos,
  getPreceptorComisiones,
  getPreceptorAlumnosMetrics,
  getPreceptorAsistenciasFechas,
  getPreceptorAsistenciasLista,
  savePreceptorAsistencias,
  getPreceptorNotificaciones,
  updatePreceptorNotificacion,
  deletePreceptorNotificacion,
  sendPreceptorComunicacion,
} from "../controllers/preceptores.controller.js";

const router = Router();

router.get("/me/datos", auth, allowRoles("preceptor"), getPreceptorDatos);
router.get("/me/comisiones", auth, allowRoles("preceptor"), getPreceptorComisiones);
router.get("/me/alumnos-metrics", auth, allowRoles("preceptor"), getPreceptorAlumnosMetrics);

// Asistencia
router.get(
  "/me/asistencias/fechas",
  auth,
  allowRoles("preceptor"),
  getPreceptorAsistenciasFechas
);

router.get(
  "/me/asistencias",
  auth,
  allowRoles("preceptor"),
  getPreceptorAsistenciasLista
);

router.post(
  "/me/asistencias",
  auth,
  allowRoles("preceptor"),
  savePreceptorAsistencias
);

// Notificaciones
router.get(
  "/me/notificaciones",
  auth,
  allowRoles("preceptor"),
  getPreceptorNotificaciones
);

router.patch(
  "/me/notificaciones/:id",
  auth,
  allowRoles("preceptor"),
  updatePreceptorNotificacion
);

router.delete(
  "/me/notificaciones/:id",
  auth,
  allowRoles("preceptor"),
  deletePreceptorNotificacion
);

router.post(
  "/me/comunicaciones",
  auth,
  allowRoles("preceptor"),
  sendPreceptorComunicacion
);

export default router;