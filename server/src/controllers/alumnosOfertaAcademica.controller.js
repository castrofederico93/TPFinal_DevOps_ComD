// alumnosOfertaAcademica.controller.js

import prisma from "../db/prisma.js"; // Asegúrate de que esta ruta sea correcta

// ===============================================
// FUNCIONES AUXILIARES (Necesarias para CRUD Alumnos)
// ===============================================

/**
 * Obtiene el próximo ID de alumno disponible, consultando el máximo actual.
 * (Necesario si la columna `id` de `alumnos` no es AUTO_INCREMENT en la DB).
 */
async function getNextAlumnoId() {
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(MAX(id), 0) AS maxId
    FROM alumnos;
  `;

  const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : { maxId: 0 };

  const maxId =
    typeof row.maxId === "bigint"
      ? Number(row.maxId)
      : Number(row.maxId || 0);

  return maxId + 1;
}

// ===============================================
// CONTROLADORES DE ALUMNOS
// ===============================================

/**
 * POST /alumnos
 * Crea un nuevo alumno y su inscripción en una sola transacción anidada.
 */
const alumnosOfertaAcademica = async (req, res) => {
  const { dni, nombre, apellido, email, telefono, materia_id } = req.body;

  if (!dni || !nombre || !apellido || !materia_id) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (DNI, Nombre, Apellido y Curso).",
    });
  }

  try {
    // 1. Obtener el próximo ID si el campo no es auto-incremental
    const newId = await getNextAlumnoId();

    // 2. Buscar una comisión por defecto para esa materia_id
    const materiaIdParsed = parseInt(materia_id, 10);
    const comision = await prisma.comisiones.findFirst({
      where: { materia_id: materiaIdParsed },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    if (!comision) {
      return res.status(400).json({
        error: "No se encontró una comisión para la materia seleccionada.",
      });
    }

    // 3. Realiza la transacción (crear alumno y su inscripción) con nested write
    const nuevoAlumno = await prisma.alumnos.create({
      data: {
        id: newId, // Asignación manual de ID (basado en tu router anterior)
        dni,
        nombre,
        apellido,
        email: email || null,
        telefono: telefono || null,
        materia_id: materiaIdParsed,
        comision_id: comision.id,

        // Crea la inscripción asociada
        inscripciones: {
          create: {
            materia_id: materiaIdParsed,
            comision_id: comision.id,
            fecha_inscripcion: new Date(),
            estado: "activa",
          },
        },
      },
    });

    // Respuesta simplificada, incluyendo el ID de la materia para el frontend
    res.status(201).json({
      ...nuevoAlumno,
      materia_id: materiaIdParsed,
    });
  } catch (error) {
    console.error("Error al crear alumno y/o inscripción:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con este DNI." });
    }
    res.status(500).json({ error: "Error de servidor al crear el alumno y su inscripción." });
  }
};


/**
 * GET /alumnos
 * Obtiene la lista completa de alumnos con su materia y comisión principal.
 */
const getAlumnos = async (_req, res) => {
  try {
    const alumnos = await prisma.alumnos.findMany({
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        inscripciones: {
          orderBy: { fecha_insc: "asc" },
          select: {
            comisiones: {
              select: {
                letra: true,
                materias: {
                  select: { id: true, nombre: true },
                },
              },
            },
          },
        },
      },
    });

    const alumnosConMateria = alumnos.map((alumno) => {
      const primeraInscripcion = alumno.inscripciones[0];
      const comisionData = primeraInscripcion?.comisiones || null;
      const materia = comisionData?.materias || null;

      return {
        id: alumno.id,
        dni: alumno.dni,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        telefono: alumno.telefono,
        email: alumno.email,
        materia_id: materia ? materia.id : null,
        nombre_materia: materia ? materia.nombre : "Sin Asignar",
        nombre_comision: comisionData ? comisionData.letra : "Sin Asignar",
      };
    });

    return res.json(alumnosConMateria);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * PUT /alumnos/:id
 * Actualiza los datos de un alumno y su inscripción principal si se cambia la materia.
 */
const updateAlumno = async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);
  const { dni, nombre, apellido, telefono, email, materia_id } = req.body;

  try {
    let comisionParaInscripcion = null;
    const materiaIdParsed = parseInt(materia_id, 10);

    // 1. Buscar la comisión por defecto si se provee una nueva materia
    if (materiaIdParsed) {
      comisionParaInscripcion = await prisma.comisiones.findFirst({
        where: { materia_id: materiaIdParsed },
        orderBy: { id: "asc" },
      });
    }

    // 2. Actualizar los datos del alumno
    const alumnoActualizado = await prisma.alumnos.update({
      where: { id: alumnoId },
      data: {
        dni,
        nombre,
        apellido,
        telefono: telefono || null,
        email: email || null,
      },
    });

    // 3. Actualizar la inscripción principal
    if (comisionParaInscripcion) {
      const inscripcionActual = await prisma.inscripciones.findFirst({
        where: { alumno_id: alumnoId },
        orderBy: { fecha_insc: "asc" },
      });

      if (inscripcionActual) {
        // Actualiza la inscripción existente
        await prisma.inscripciones.update({
          where: { id: inscripcionActual.id },
          data: { comision_id: comisionParaInscripcion.id },
        });
      } else {
        // Crea una nueva inscripción si no existía (caso borde)
        await prisma.inscripciones.create({
          data: {
            alumno_id: alumnoId,
            comision_id: comisionParaInscripcion.id,
            estado: "activa",
            fecha_insc: new Date(),
          },
        });
      }
    }

    return res.json({
      ...alumnoActualizado,
      materia_id: materiaIdParsed || null,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Alumno no encontrado para actualizar.",
      });
    }
    if (error.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un alumno con este DNI." });
    }
    console.error("Error al actualizar alumno:", error);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar el alumno." });
  }
};

/**
 * DELETE /alumnos/:id
 * Elimina un alumno y todas sus dependencias (transacción).
 */
const deleteAlumno = async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);

  try {
    await prisma.$transaction([
      prisma.justificaciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.calificaciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.asistencias.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.inscripciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.alumnos.delete({ where: { id: alumnoId } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Alumno no encontrado." });
    }
    console.error("Error al eliminar alumno:", error);
    return res.status(500).json({
      error: "Error interno al eliminar el alumno.",
    });
  }
};

export default {
    alumnosOfertaAcademica, // POST /alumnos
    getAlumnos,           // GET /alumnos
    updateAlumno,         // PUT /alumnos/:id
    deleteAlumno,         // DELETE /alumnos/:id
};