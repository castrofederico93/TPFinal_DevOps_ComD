// src/pages/alumnos/Calificaciones.jsx
import React from "react";

export default function CalificacionesPanel({
  setActive,
  gradesFiltered = [],
  gradeFilter,
  setGradeFilter,
  materiaById = {}
}) {
  return (
    <div className="grades-wrap">
      <div className="enroll-card grades-card">
        
        {/* HEADER */}
        <div className="enroll-header">
          <h2 className="enroll-title">Calificaciones</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* FILTRO */}
        <div className="grades-filter">
          <label className="grades-filter__label">
            Filtrar por materia:&nbsp;
          </label>
          <input
            className="grades-input"
            type="text"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            placeholder="Ej: Matemáticas"
          />
        </div>

        {/* TABLA */}
        <div className="grades-table-wrap">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Comisión</th>
                <th>Parcial I</th>
                <th>Parcial II</th>
                <th>Parcial III</th>
                <th>Estado</th>
                <th>Observaciones</th>
              </tr>
            </thead>

            <tbody>
              {gradesFiltered.map((r, i) => {
                const materia = materiaById[r.materiaId];

                return (
                  <tr key={r.id || i}>
                    <td>{materia?.nombre || r.materiaId}</td>
                    <td>{r.comision}</td>

                    <td className="num">{r.parciales?.p1 ?? "—"}</td>
                    <td className="num">{r.parciales?.p2 ?? "—"}</td>
                    <td className="num">{r.parciales?.p3 ?? "—"}</td>

                    <td>{r.estado}</td>
                    <td>{r.observacion || "—"}</td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}
