import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

// ===============================================
// GET /api/constancias/historial/:alumnoId
// Historial académico de un alumno
// ===============================================
router.get("/historial/:alumnoId", async (req, res) => {
  try {
    const alumnoId = Number(req.params.alumnoId);

    if (!alumnoId || Number.isNaN(alumnoId)) {
      return res.status(400).json({ error: "ID de alumno no válido." });
    }

    // Consulta SQL cruda contra tus tablas reales:
    // inscripciones, comisiones, materias, calificaciones
    const historial = await prisma.$queryRaw`
      SELECT
        M.nombre      AS materia,
        C.letra       AS comision,
        CA.p1         AS p1,
        CA.p2         AS p2,
        CA.p3         AS p3,
        COALESCE(CA.estado, 'Inscripto') AS estado_materia,
        I.fecha_insc  AS fecha_inscripcion,
        CA.anio       AS anio_cursada
      FROM inscripciones I
      INNER JOIN comisiones C ON I.comision_id = C.id
      INNER JOIN materias   M ON C.materia_id = M.id
      LEFT JOIN calificaciones CA
        ON  I.alumno_id  = CA.alumno_id
        AND I.comision_id = CA.comision_id
      WHERE I.alumno_id = ${alumnoId}
      ORDER BY CA.anio, M.nombre;
    `;

    const dataForTable = (historial || []).map((item) => {
      const p1 = item.p1 ?? "-";
      const p2 = item.p2 ?? "-";
      const p3 = item.p3 ?? "-";

      const notasNumericas = [p1, p2, p3]
        .filter((n) => n !== "-" && n != null)
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n));

      const notaFinal =
        notasNumericas.length > 0
          ? (
              notasNumericas.reduce((sum, n) => sum + n, 0) /
              notasNumericas.length
            ).toFixed(1)
          : "-";

      const estadoMateria = item.estado_materia || "Inscripto";

      let estadoAprobacion;
      if (estadoMateria === "Aprobado" || estadoMateria === "Promocionado") {
        estadoAprobacion = "Aprobado";
      } else if (estadoMateria === "Inscripto") {
        estadoAprobacion = "En Curso";
      } else {
        estadoAprobacion = "Regular/Final";
      }

      const fechaInsc = item.fecha_inscripcion
        ? new Date(item.fecha_inscripcion).toLocaleDateString("es-AR")
        : "-";

      // Formato pensado para jsPDF-autotable: array de columnas
      return [
        item.materia,
        item.comision,
        notaFinal,
        fechaInsc,
        estadoAprobacion,
      ];
    });

    res.json(dataForTable);
  } catch (error) {
    console.error("Error al obtener historial académico:", error);
    res.status(500).json({
      error: "Error de servidor al obtener el historial académico.",
    });
  }
});

export default router;