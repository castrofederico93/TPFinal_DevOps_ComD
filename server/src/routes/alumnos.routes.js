// server/src/routes/alumnos.routes.js
import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();

// Primero autenticamos siempre, así req.user está disponible en todas las rutas
r.use(auth);

// GET /api/alumnos/me/datos
r.get("/me/datos", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    return res.json(alumno);
  } catch (err) {
    console.error("GET /api/alumnos/me/datos error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/alumnos/me/calificaciones
r.get("/me/calificaciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        // Según tu schema HEAD:
        // calificaciones -> comisiones  (relación)
        // comisiones -> materias       (relación)
        comisiones: {
          include: {
            materias: true,
          },
        },
      },
    });

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/alumnos/me/calificaciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/alumnos/me/asistencias
r.get("/me/asistencias", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const rows = await prisma.asistencias.findMany({
      where: { alumno_id: alumno.id },
      include: {
        // Según tu schema HEAD:
        // asistencias -> comisiones  (relación)
        // comisiones -> materias     (relación)
        comisiones: {
          include: {
            materias: true,
          },
        },
      },
    });

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/alumnos/me/asistencias error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/alumnos
// Usado para gestión (por ejemplo, constancias) por admin y preceptor
r.get("/", allowRoles("administrador", "preceptor"), async (_req, res) => {
  try {
    const alumnos = await prisma.alumnos.findMany({
      // En tu schema no existe 'curso', así que devolvemos solo estos campos
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
      },
    });

    return res.json(alumnos);
  } catch (error) {
    console.error("Error al listar alumnos para gestión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default r;