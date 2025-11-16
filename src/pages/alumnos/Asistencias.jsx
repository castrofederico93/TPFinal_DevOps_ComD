// src/pages/alumnos/Asistencias.jsx
import React, { useEffect, useState } from "react";
import "../../styles/alumnos.css";

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const ESTADOS = { P: "Presente", A: "Ausente", T: "Tarde", J: "Justificado" };

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const res = await fetch("/api/alumnos/me/asistencias");
        const data = await res.json();

        // Mapear los datos para que React pueda renderizar correctamente
        const formateadas = data.map(a => ({
          id: a.id,
          fecha: a.fecha,
          estado: a.estado,
          materia: a.comision?.materia?.nombre || "-",
          comision: a.comision?.letra || "-",
        }));

        setAsistencias(formateadas);
      } catch (err) {
        console.error("Error trayendo asistencias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsistencias();
  }, []);

  if (loading) return <p>Cargando asistencias...</p>;
  if (asistencias.length === 0) return <p>No hay asistencias registradas.</p>;

  return (
    <div className="asistencias-container">
      <h2>Asistencias del alumno</h2>
      <table className="asistencias-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Materia</th>
            <th>Comisión</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {asistencias.map(a => (
            <tr key={a.id}>
              <td>{new Date(a.fecha).toLocaleDateString()}</td>
              <td>{a.materia}</td>
              <td>{a.comision}</td>
              <td className={`estado-${a.estado}`}>
                {ESTADOS[a.estado] || a.estado}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
