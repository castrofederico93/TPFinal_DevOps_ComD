import prisma from "../db/prisma.js";

async function getPreceptorOr404(req, res) {
  const me = await prisma.preceptores.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true, nombre: true, apellido: true, usuario_id: true },
  });

  if (!me) {
    res.status(404).json({ error: "Preceptor no encontrado" });
    return null;
  }
  return me;
}

// GET /api/preceptores/me/datos
export async function getPreceptorDatos(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;
    res.json(me);
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/comisiones
export async function getPreceptorComisiones(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

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
            estado: true,
            materias: { select: { id: true, codigo: true, nombre: true } },
            docentes: { select: { id: true, nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { comision_id: "asc" },
    });

    const out = (vinculos || []).map((v) => {
      const c = v.comisiones;
      return {
        id: c.id,
        materia: {
          id: c.materias?.id,
          codigo: c.materias?.codigo,
          nombre: c.materias?.nombre ?? "-",
        },
        comision: c.codigo,
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
}

// GET /api/preceptores/me/alumnos-metrics
export async function getPreceptorAlumnosMetrics(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const rows = await prisma.$queryRaw`
      SELECT
        a.id AS alumnoId,
        CONCAT(a.apellido, ', ', a.nombre) AS alumno,
        a.email AS email,
        c.id AS comisionId,
        c.codigo AS comisionCodigo,
        COALESCE(SUM(CASE WHEN asis.estado = 'P' THEN 1 ELSE 0 END), 0) AS presentes,
        COALESCE(SUM(CASE WHEN asis.estado = 'T' THEN 1 ELSE 0 END), 0) AS tardes,
        COALESCE(COUNT(DISTINCT asis.fecha), 0) AS totalClases,
        COALESCE(COUNT(DISTINCT j.id), 0) AS justificaciones
      FROM inscripciones i
        INNER JOIN alumnos a ON a.id = i.alumno_id
        INNER JOIN comisiones c ON c.id = i.comision_id
        INNER JOIN preceptor_comision pc ON pc.comision_id = c.id
        LEFT JOIN asistencias asis
          ON asis.comision_id = c.id AND asis.alumno_id = a.id
        LEFT JOIN justificaciones j
          ON j.comision_id = c.id AND j.alumno_id = a.id
      WHERE pc.preceptor_id = ${me.id}
        AND i.estado = 'activa'
      GROUP BY
        a.id, a.apellido, a.nombre, a.email,
        c.id, c.codigo
      ORDER BY alumno, comisionCodigo;
    `;

    const toNum = (v) => (typeof v === "bigint" ? Number(v) : v ?? 0);

    const out = (rows || []).map((r) => ({
      alumnoId: Number(r.alumnoId),
      alumno: r.alumno,
      email: r.email,
      comisionId: Number(r.comisionId),
      comisionCodigo: r.comisionCodigo,
      presentes: toNum(r.presentes),
      tardes: toNum(r.tardes),
      totalClases: toNum(r.totalClases),
      justificaciones: toNum(r.justificaciones),
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
}