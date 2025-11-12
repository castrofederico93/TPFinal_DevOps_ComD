import { Router } from "express";
import prisma from "../db/prisma.js";
import { auth, allowRoles } from "../middlewares/auth.js";

const router = Router();

// GET /api/preceptores/me/datos
router.get("/me/datos", auth, allowRoles("preceptor"), async (req, res, next) => {
  try {
    const me = await prisma.preceptores.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true, nombre: true, apellido: true, usuario_id: true },
    });
    if (!me) return res.status(404).json({ error: "Preceptor no encontrado" });
    res.json(me);
  } catch (err) {
    next(err);
  }
});

// GET /api/preceptores/me/comisiones
router.get("/me/comisiones", auth, allowRoles("preceptor"), async (req, res, next) => {
  try {
    const me = await prisma.preceptores.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });
    if (!me) return res.status(404).json({ error: "Preceptor no encontrado" });

    const vinculos = await prisma.preceptor_comision.findMany({
      where: { preceptor_id: me.id },
      select: {
        comisiones: {
          select: {
            id: true,
            codigo: true,
            letra: true,
            horario: true,
            cupo: true,
            sede: true,
            aula: true,
            estado: true, // requiere la columna (ver punto 2)
            materias: { select: { id: true, codigo: true, nombre: true } },
            docentes:  { select: { id: true, nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { comision_id: "asc" },
    });

    const out = (vinculos || []).map(v => {
      const c = v.comisiones;
      return {
        id: c.id,
        materia: { id: c.materias?.id, codigo: c.materias?.codigo, nombre: c.materias?.nombre ?? "-" },
        comision: c.codigo,                    // ej: "MAT-1_A"
        horario: c.horario || "-",
        sede: c.sede || "Central",
        aula: c.aula || "A confirmar",
        docente: c.docentes ? `${c.docentes.nombre} ${c.docentes.apellido}` : "-",
        estado: c.estado || "Inscripción",
        cupo: c.cupo ?? null,
      };
    });

    res.json(out);
  } catch (err) {
    next(err);
  }
});

export default router;