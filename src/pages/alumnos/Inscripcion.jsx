// src/components/alumnos/Inscripcion.jsx
import React from 'react';

export default function InscripcionPanel({
  setActive,
  materiasDisponibles = [],
  inscripto = [],
  materiaById = {},
  showEnrollOk,
  handleRegister,
  handleUnregister
}) {
  return (
    <div className="enroll-wrap">
      <div className="enroll-card">

        {/* Header */}
        <div className="enroll-header">
          <h2 className="enroll-title">Inscripción a Materias</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        <div className="enroll-cols">

          {/* Columna: Materias disponibles */}
          <div className="enroll-col">
            <div className="enroll-col__head">Materias disponibles</div>

            <div className="enroll-list">
              {materiasDisponibles.length === 0 ? (
                <p>No hay materias disponibles.</p>
              ) : (
                materiasDisponibles.map((m) => (
                  <div className="enroll-item" key={m.id || m.materiaId}>
                    <h4>{m.nombre}</h4>
                    <p className="enroll-meta">Comisión: {m.comision || "—"}</p>
                    <p className="enroll-meta">Horario: {m.horario || "—"}</p>
                    <p className="enroll-meta">Cupo: {m.cupo ?? "—"}</p>

                    <div className="enroll-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRegister(m.id)}
                      >
                        Registrarse
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna: Mis inscripciones */}
          <div className="enroll-col">
            <div className="enroll-col__head">Mis inscripciones</div>

            <div className="enroll-list">
              {inscripto.length === 0 ? (
                <p>Aún no tienes inscripciones.</p>
              ) : (
                inscripto.map((id, i) => {
                  const m = materiaById[id];

                  return (
                    <div className="enroll-item" key={id || i}>
                      <h4>{m?.nombre || `Materia ${id}`}</h4>
                      <p className="enroll-meta">Comisión: {m?.comision || "—"}</p>
                      <p className="enroll-meta">Horario: {m?.horario || "—"}</p>

                      <div className="enroll-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleUnregister(id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {showEnrollOk && (
                <p className="enroll-success">¡Inscripción exitosa! 🎉</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
