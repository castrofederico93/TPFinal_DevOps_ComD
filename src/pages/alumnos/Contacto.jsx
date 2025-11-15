// src/pages/alumnos/Contacto.jsx
import React from "react";

export default function ContactoPanel({
  setActive,
  contactoInst = {},
  docentesFiltrados = [],
  qContacto,
  setQContacto
}) {
  return (
    <div className="contacto-wrap">
      <div className="contacto-card">

        {/* HEADER */}
        <div className="contacto-header">
          <h2 className="contacto-title">Contacto</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* INFO INSTITUCIONAL */}
        <section className="contacto-box">
          <h3 className="contacto-sub">{contactoInst.nombre || "Institución"}</h3>

          <ul className="contacto-list">
            <li>📍 Dirección: {contactoInst.direccion || "—"}</li>
            <li>📞 Teléfono: {contactoInst.telefono || "—"}</li>

            <li>
              ✉️ Secretaría:{" "}
              {contactoInst.email_secretaria ? (
                <a
                  className="mail-link"
                  href={`mailto:${contactoInst.email_secretaria}`}
                >
                  {contactoInst.email_secretaria}
                </a>
              ) : (
                "—"
              )}
            </li>
          </ul>
        </section>

        {/* BUSCADOR */}
        <div className="contacto-search">
          <input
            className="notes-input"
            placeholder="Buscar por docente, materia, email, etc..."
            value={qContacto}
            onChange={(e) => setQContacto(e.target.value)}
          />
        </div>

        {/* TABLA DOCENTES */}
        <section className="contacto-box">
          <h3 className="contacto-sub">Docentes</h3>

          <div className="tabla-scroll">
            <table className="tabla-contacto">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                </tr>
              </thead>

              <tbody>
                {docentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      No se encontraron resultados.
                    </td>
                  </tr>
                ) : (
                  docentesFiltrados.map((doc, i) => (
                    <tr key={doc.id || i}>
                      <td>{doc.nombre} {doc.apellido}</td>

                      <td>
                        {doc.email ? (
                          <a className="mail-link" href={`mailto:${doc.email}`}>
                            {doc.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>{doc.telefono || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
