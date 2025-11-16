// src/pages/alumnos/Inscripcion.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api"; // tu función para fetch con token

export default function Inscripcion() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  // ===============================
  // Cargar materias disponibles
  // ===============================
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await apiFetch("/api/alumnos/materias"); // endpoint real
        setMaterias(data);
      } catch (err) {
        console.error("Error trayendo materias:", err);
        setError("No se pudieron cargar las materias.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  // ===============================
  // Handler para inscribirse
  // ===============================
  const inscribir = async (materiaId) => {
    if (!window.confirm("¿Desea inscribirse en esta materia?")) return;
    setInscribiendo(true);
    try {
      const res = await apiFetch("/api/alumnos/inscribir", {
        method: "POST",
        body: JSON.stringify({ materiaId }),
        headers: { "Content-Type": "application/json" },
      });

      alert("Inscripción realizada con éxito");
      // opcional: actualizar materias disponibles si el backend lo requiere
    } catch (err) {
      console.error("Error al inscribirse:", err);
      alert("No se pudo inscribir. Intente nuevamente.");
    } finally {
      setInscribiendo(false);
    }
  };

  if (loading) return <p>Cargando materias...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Materias Disponibles</h2>
      {materias.length === 0 ? (
        <p>No hay materias registradas.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Comisión</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.codigo}</td>
                <td>{m.nombre}</td>
                <td>{m.comision || "-"}</td>
                <td>
                  <button
                    onClick={() => inscribir(m.id)}
                    disabled={inscribiendo}
                  >
                    {inscribiendo ? "Inscribiendo..." : "Inscribirse"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
