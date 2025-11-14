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

// GET /api/preceptores/me/asistencias/fechas?comisionId=1
export async function getPreceptorAsistenciasFechas(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const comisionId = Number(req.query.comisionId);
    if (!comisionId || Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comisionId },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const rows = await prisma.$queryRaw`
      SELECT DISTINCT fecha
      FROM asistencias
      WHERE comision_id = ${comisionId}
      ORDER BY fecha DESC;
    `;

    const fechas = (rows || []).map((r) => {
      const d = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
      return d.toISOString().slice(0, 10);
    });

    res.json(fechas);
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/asistencias?comisionId=1&fecha=2025-09-19
export async function getPreceptorAsistenciasLista(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const comisionId = Number(req.query.comisionId);
    const fecha = String(req.query.fecha || "");

    if (!comisionId || Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comisionId },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const rows = await prisma.$queryRaw`
      SELECT
        a.id AS alumnoId,
        a.apellido,
        a.nombre,
        a.dni,
        asis.estado
      FROM inscripciones i
        INNER JOIN alumnos a ON a.id = i.alumno_id
        INNER JOIN preceptor_comision pc ON pc.comision_id = i.comision_id
        LEFT JOIN asistencias asis
          ON asis.alumno_id = i.alumno_id
         AND asis.comision_id = i.comision_id
         AND asis.fecha = ${fecha}
      WHERE i.comision_id = ${comisionId}
        AND i.estado = 'activa'
        AND pc.preceptor_id = ${me.id}
      ORDER BY a.apellido, a.nombre;
    `;

    const out = (rows || []).map((r) => ({
      alumnoId: Number(r.alumnoId),
      apellido: r.apellido,
      nombre: r.nombre,
      dni: r.dni,
      estado: r.estado || "",
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
}

// POST /api/preceptores/me/asistencias
// body: { comisionId, fecha, items: [{ alumnoId, estado }, ...] }
export async function savePreceptorAsistencias(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const { comisionId, fecha, items } = req.body || {};

    const comIdNum = Number(comisionId);
    if (!comIdNum || Number.isNaN(comIdNum)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) {
      return res.status(400).json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comIdNum },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const allowedEstados = new Set(["P", "A", "T", "J"]);

    const cleanItems = Array.isArray(items)
      ? items
          .map((it) => ({
            alumnoId: Number(it.alumnoId),
            estado: String(it.estado || "").trim().toUpperCase(),
          }))
          .filter((it) => it.alumnoId && allowedEstados.has(it.estado))
      : [];

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM asistencias
        WHERE comision_id = ${comIdNum}
          AND fecha = ${fecha};
      `;

      for (const it of cleanItems) {
        await tx.$executeRaw`
          INSERT INTO asistencias (fecha, alumno_id, comision_id, estado)
          VALUES (${fecha}, ${it.alumnoId}, ${comIdNum}, ${it.estado});
        `;
      }
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}