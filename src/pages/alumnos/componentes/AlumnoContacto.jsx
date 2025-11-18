import React, { useEffect, useState, useMemo } from "react";
import { fetchAlumnoDocentes } from "../../../lib/alumnos.api";

export default function AlumnoContacto({ setActive }) {
  const [docentes, setDocentes] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetchAlumnoDocentes()
      .then((data) => {
        setDocentes(data || []);
      })
      .catch((err) => console.error("Error cargando docentes:", err));
  }, []);

  // Filtrar docentes
  const listaFiltrada = useMemo(() => {
    const f = filtro.toLowerCase().trim();
    if (!f) return docentes;

    return docentes.filter((d) =>
      `${d.nombre} ${d.apellido}`.toLowerCase().includes(f) ||
      d.email?.toLowerCase().includes(f) ||
      d.telefono?.includes(f) ||
      d.materias?.some((m) => m.toLowerCase().includes(f))
    );
  }, [filtro, docentes]);

  return (
    <div className="contacto-page">

      {/* HEADER */}
      <div className="contacto-header">
        <h2>Contacto</h2>
        
      </div>

      <div className="contacto-grid">

        {/* TARJETA INSTITUTO */}
        <div className="card card-instituto">
          <h3>Instituto Superior Prisma</h3>

          <p>📍 <strong>Dirección:</strong> Av. Siempre Viva 123, CABA</p>
          <p>📞 <strong>Teléfono:</strong> +54 11 5555-0000</p>

          <p>📧 <strong>Secretaría:</strong>
            <a href="mailto:secretaria@instituto.edu.ar"> secretaria@instituto.edu.ar</a>
          </p>

          <p>🛠 <strong>Soporte:</strong>
            <a href="mailto:soporte@instituto.edu.ar"> soporte@instituto.edu.ar</a>
          </p>

          <p>🌐 <strong>Sitio Web:</strong>
            <a href="https://instituto.edu.ar" target="_blank" rel="noreferrer">
              https://instituto.edu.ar
            </a>
          </p>

          <p>⏰ <strong>Horarios:</strong> Lun a Vie 9:00–18:00</p>
        </div>

        {/* TARJETA BUSCADOR + DOCENTES */}
        <div className="card card-docentes">

          <input
            type="text"
            className="buscador"
            placeholder="Buscar por docente, materia, comisión, horario o email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <h3>Docentes</h3>

          <div className="tabla-docentes">
            <table>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((d) => (
                  <tr key={d.id}>
                    <td>{d.nombre} {d.apellido}</td>
                    <td>
                      <a href={`mailto:${d.email}`}>{d.email}</a>
                    </td>
                    <td>{d.telefono || "-"}</td>
                  </tr>
                ))}

                {listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", opacity: 0.6 }}>
                      No se encontraron docentes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
