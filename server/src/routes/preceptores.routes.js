// src/routes/preceptores.routes.js
import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import {
  getPreceptorDatos,
  getPreceptorComisiones,
  getPreceptorAlumnosMetrics,
} from "../controllers/preceptores.controller.js";

const router = Router();

router.get("/me/datos", auth, allowRoles("preceptor"), getPreceptorDatos);
router.get("/me/comisiones", auth, allowRoles("preceptor"), getPreceptorComisiones);
router.get("/me/alumnos-metrics", auth, allowRoles("preceptor"), getPreceptorAlumnosMetrics);

export default router;