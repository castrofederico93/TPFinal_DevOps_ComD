// src/pages/alumnos/Asistencias.jsx
import React from 'react';

export default function AsistenciasPanel({
  setActive,
  resumen,
  asistencias,
  materiaById,
  jusList,
  jusForm,
  setJusForm,
  onFile,
  onSubmitJus,
  onPickTarget,
  ESTADOS,
  yaJustificada,
  MOTIVOS
}) {
  return (
    <div className="asis-wrap">
      <div className="asis-card">

        {/* HEADER */}
        <div className="asis-header">
          <h2 className="asis-title">Asistencias y Justificaciones</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* RESUMEN */}
        <div className="asis-summary">
          <div className="pill p">P: {resumen.P}</div>
          <div className="pill a">A: {resumen.A}</div>
          <div className="pill t">T: {resumen.T}</div>
          <div className="pill j">J: {resumen.J}</div>

          <div className="legend">
            <span><b>P</b> = Presente</span>
            <span><b>A</b> = Ausente</span>
            <span><b>T</b> = Tarde</span>
            <span><b>J</b> = Justificado</span>
          </div>
        </div>

        {/* TABLA ASISTENCIAS */}
        <div className="asis-table-wrap">
          <table className="asis-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Materia</th>
                <th>Comisión</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {asistencias
                .slice()
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map((a) => {
                  const m = materiaById[a.materiaId];
                  const estadoTxt = ESTADOS[a.estado] || a.estado;

                  const puedeJustificar =
                    (a.estado === "A" || a.estado === "T") &&
                    !yaJustificada(a);

                  return (
                    <tr key={a.id}>
                      <td>{new Date(a.fecha).toLocaleDateString("es-AR")}</td>
                      <td>{m?.nombre || a.materiaId}</td>
                      <td>{a.comision}</td>

                      <td>
                        <span className={`badge-state est-${a.estado.toLowerCase()}`}>
                          {estadoTxt}
                        </span>
                      </td>

                      <td>
                        {puedeJustificar ? (
                          <button
                            className="btn btn-justificar"
                            onClick={() =>
                              onPickTarget(`${a.fecha}|${a.materiaId}|${a.comision}`)
                            }
                          >
                            Justificar
                          </button>
                        ) : (
                          <span className="muted">
                            {(a.estado === "A" || a.estado === "T")
                              ? "Ya justificada"
                              : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* FORMULARIO DE JUSTIFICACIÓN */}
        <div className="jus-card">
          <h3 className="jus-title">Cargar certificado / justificación</h3>

          <form
            className="jus-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitJus();
            }}
          >

            {/* Motivo */}
            <div className="row">
              <label>Motivo</label>
              <select
                className="jus-input"
                value={jusForm.motivo || ""}
                onChange={(e) =>
                  setJusForm((f) => ({
                    ...f,
                    motivo: e.target.value,
                    motivoOtro: "",
                  }))
                }
              >
                <option value="">Seleccione un motivo…</option>

                {/* Ahora funciona con objetos tipo { M: "Médico", O: "Otro" } */}
                {Object.entries(MOTIVOS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo Otro */}
            {jusForm.motivo === "Otro" && (
              <div className="row">
                <label>Detalle (motivo “Otro”)</label>
                <input
                  className="jus-input"
                  type="text"
                  value={jusForm.motivoOtro || ""}
                  onChange={(e) =>
                    setJusForm((f) => ({ ...f, motivoOtro: e.target.value }))
                  }
                />
              </div>
            )}

            {/* Archivo */}
            <div className="row">
              <label>Adjuntar certificado (PDF / imagen)</label>
              <input
                className="jus-input"
                type="file"
                accept=".pdf,image/*"
                onChange={onFile}
              />
            </div>

            <div className="row right">
              <button className="btn btn-success" type="submit">
                Enviar justificación
              </button>
            </div>
          </form>
        </div>

        {/* MIS JUSTIFICACIONES */}
        <div className="jus-table-wrap">
          <h3 className="jus-title">Mis justificaciones</h3>

          {jusList.length === 0 ? (
            <p className="muted">Aún no cargaste justificaciones.</p>
          ) : (
            <table className="asis-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Materia</th>
                  <th>Comisión</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Documento</th>
                </tr>
              </thead>

              <tbody>
                {jusList
                  .slice()
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .map((j) => {
                    const m = materiaById[j.materiaId];

                    return (
                      <tr key={j.id}>
                        <td>{new Date(j.fecha).toLocaleDateString("es-AR")}</td>
                        <td>{m?.nombre || j.materiaId}</td>
                        <td>{j.comision}</td>
                        <td>{j.motivo}</td>

                        <td>
                          <span className={`badge-state est-${j.estado.toLowerCase()}`}>
                            {j.estado}
                          </span>
                        </td>

                        <td>
                          {j.documentoUrl ? (
                            <a href={j.documentoUrl} target="_blank" rel="noreferrer">
                              Ver
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
