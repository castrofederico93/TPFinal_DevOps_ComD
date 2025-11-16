import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================

function getValidDocenteId(idValue) {
  if (!idValue) return null;
  const parsedId = parseInt(idValue, 10);
  return !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : null;
}

function toNumberOrNull(v) {
  if (v == null) return null;
  if (typeof v === "bigint") return Number(v);
  return Number(v);
}

// ===============================================
// 1. GET /  (listar oferta académica)
// ===============================================
router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        c.id          AS id,
        m.nombre      AS nombre,
        c.docente_id  AS docenteId,
        c.letra       AS comision,
        c.horario     AS horario,
        c.cupo        AS cupo
      FROM materias m
      INNER JOIN comisiones c ON m.id = c.materia_id
    `;

    const out = (rows || []).map((r) => ({
      id: toNumberOrNull(r.id),
      nombre: r.nombre,
      docenteId: r.docenteId != null ? toNumberOrNull(r.docenteId) : null,
      comision: r.comision,
      horario: r.horario,
      cupo: r.cupo != null ? toNumberOrNull(r.cupo) : null,
    }));

    res.json(out);
  } catch (error) {
    console.error("Error al obtener oferta académica:", error);
    res.status(500).json({
      error:
        "Error de servidor al procesar la oferta académica. Revisar logs.",
    });
  }
});

// ===============================================
// 2. POST /  (crear Materia y Comisión)
// ===============================================
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      docenteId: docenteIdFrontend,
      comision,
      horario,
      cupo,
    } = req.body;

    const validDocenteId = getValidDocenteId(docenteIdFrontend);

    const materiaCodigo = "MAT_" + Date.now().toString().slice(-6);

    const nuevaMateria = await prisma.materias.create({
      data: {
        nombre,
        codigo: materiaCodigo,
      },
    });

    const nuevaComision = await prisma.comisiones.create({
      data: {
        materia_id: nuevaMateria.id,
        docente_id: validDocenteId,
        letra: comision,
        horario,
        cupo: cupo != null ? parseInt(cupo, 10) || null : null,
        codigo: `${materiaCodigo}_COM_${comision}`,
      },
    });

    res.json({
      id: nuevaComision.id,
      nombre: nuevaMateria.nombre,
      docenteId: nuevaComision.docente_id,
      comision: nuevaComision.letra,
      horario: nuevaComision.horario,
      cupo: nuevaComision.cupo,
    });
  } catch (error) {
    console.error("Error al crear la materia y comisión:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Error de Docente: el ID del docente proporcionado no existe en la base de datos.",
      });
    }
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Ya existe una materia o comisión con esos datos (código único).",
      });
    }
    res.status(500).json({ error: "Error al crear la materia." });
  }
});

// ===============================================
// 3. PUT /:id  (actualizar Materia y Comisión)
// ===============================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      docenteId: docenteIdFrontend,
      comision,
      horario,
      cupo,
    } = req.body;

    const validDocenteId = getValidDocenteId(docenteIdFrontend);

    const comisionActual = await prisma.comisiones.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!comisionActual) {
      return res.status(404).json({ error: "Comisión no encontrada." });
    }

    await prisma.materias.update({
      where: { id: comisionActual.materia_id },
      data: { nombre },
    });

    const comisionActualizada = await prisma.comisiones.update({
      where: { id: parseInt(id, 10) },
      data: {
        docente_id: validDocenteId,
        letra: comision,
        horario,
        cupo: cupo != null ? parseInt(cupo, 10) || null : null,
      },
    });

    res.json({
      materia: { nombre },
      comision: comisionActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la oferta académica:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Error de Docente: el ID del docente proporcionado no existe en la base de datos.",
      });
    }
    res.status(500).json({ error: "Error al actualizar la materia." });
  }
});

// ===============================================
// 4. DELETE /:id  (eliminar Comisión)
// ===============================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comisiones.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar la comisión:", error);
    res.status(500).json({
      error:
        "Error al eliminar la comisión. Podría estar asociada a inscripciones, asistencias u otras tablas.",
    });
  }
});

export default router;