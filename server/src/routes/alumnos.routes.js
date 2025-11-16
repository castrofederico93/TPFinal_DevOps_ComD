import { Router } from "express";
import prisma from "../db/prisma.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const r = Router();

// Configuración multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/justificaciones";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

// ===============================
// Obtener materias
// ===============================
r.get("/materias", async (req, res) => {
  try {
    const materias = await prisma.materias.findMany({
      include: { comisiones: true },
    });
    return res.json(materias);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// Obtener datos del alumno logueado
// ===============================
r.get("/me/datos", async (req, res) => {
  try {
    const alumnoId = req.user?.id || 1;

    const alumno = await prisma.alumnos.findUnique({
      where: { id: alumnoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        email: true,
        avatar: true,
      },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
    return res.json(alumno);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// Obtener asistencias del alumno (con formato simplificado)
// ===============================
r.get("/me/asistencias", async (req, res) => {
  try {
    const alumnoId = req.user?.id || 1;

    const asistencias = await prisma.asistencias.findMany({
      where: { alumno_id: alumnoId },
      include: {
        comision: {
          include: {
            materia: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    // Mapear solo lo que necesitamos
    const resultado = asistencias.map((a) => ({
      id: a.id,
      fecha: a.fecha,
      estado: a.estado,
      materia: a.comision?.materia?.nombre || "-",
      comision: a.comision?.letra || "-",
    }));

    return res.json(resultado);
  } catch (err) {
    console.error("Error en /me/asistencias:", err);
    return res.status(500).json({ error: "Error al obtener asistencias" });
  }
});

// ===============================
// Obtener justificaciones del alumno
// ===============================
r.get("/me/justificaciones", async (req, res) => {
  try {
    const alumnoId = req.user?.id || 1;

    const justificaciones = await prisma.justificaciones.findMany({
      where: { alumno_id: alumnoId },
      include: {
        comision: { include: { materia: true } },
      },
      orderBy: { fecha: "desc" },
    });

    return res.json(justificaciones);
  } catch (err) {
    console.error("Error en /me/justificaciones:", err);
    return res.status(500).json({ error: "Error al obtener justificaciones" });
  }
});

// ===============================
// Subir nueva justificación
// ===============================
r.post("/me/justificaciones", upload.single("documento"), async (req, res) => {
  try {
    const alumnoId = req.user?.id || 1;
    const { fecha, comision_id, motivo, motivoOtro } = req.body;

    const documento_url = req.file ? `/uploads/justificaciones/${req.file.filename}` : null;

    const nuevaJustificacion = await prisma.justificaciones.create({
      data: {
        alumno_id: alumnoId,
        comision_id: Number(comision_id),
        fecha: new Date(fecha),
        motivo: motivoOtro || motivo,
        documento_url,
        estado: "pendiente",
      },
    });

    return res.json(nuevaJustificacion);
  } catch (err) {
    console.error("Error al guardar justificación:", err);
    return res.status(500).json({ error: "Error al guardar justificación" });
  }
});

export default r;
