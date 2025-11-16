// src/pages/alumnos/AlumnoRender.jsx
import React, { useState, useEffect, useRef } from "react";
import Perfil from "./Perfil";
import Inscripcion from "./Inscripcion";
import "../../styles/alumnos.css";

export default function AlumnoRender() {
  // ===============================
  // Estado general
  // ===============================
  const [active, setActive] = useState("inscripcion"); // panel activo
  const [alumno, setAlumno] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/alumno.jpg");
  const [asistenciasData, setAsistenciasData] = useState({
    asistencias: [],
    materiaById: {},
    resumen: { P: 0, A: 0, T: 0, J: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  // ===============================
  // Cargar datos del alumno y asistencias desde API
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchAlumno = fetch("/api/alumnos/me/datos", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    const fetchAsistencias = fetch("/api/alumnos/me/asistencias", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    Promise.all([fetchAlumno, fetchAsistencias])
      .then(([alumnoData, asistenciasData]) => {
        setAlumno(alumnoData);
        setAsistenciasData(asistenciasData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos");
        setLoading(false);
      });
  }, []);

  // ===============================
  // Funciones de avatar
  // ===============================
  const choosePhoto = () => fileRef.current && fileRef.current.click();
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && setAvatarSrc(reader.result);
    reader.readAsDataURL(file);
  };

  // ===============================
  // Sidebar items
  // ===============================
  const menuItems = [
    { id: "perfil", label: "Mi Perfil" },
    { id: "inscripcion", label: "Inscripción a materias" },
    { id: "asistencias", label: "Asistencias" },
  ];

  // ===============================
  // Render panel según activo
  // ===============================
  const renderPanel = () => {
    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p className="error">{error}</p>;

    switch (active) {
      case "perfil":
        return (
          <Perfil
            alumno={alumno}
            avatarSrc={avatarSrc}
            fileRef={fileRef}
            choosePhoto={choosePhoto}
            onPhotoChange={onPhotoChange}
            showPwd={false}
            setShowPwd={() => {}}
            pwd1=""
            setPwd1={() => {}}
            pwd2=""
            setPwd2={() => {}}
            savePassword={() => {}}
          />
        );
      case "inscripcion":
        return <Inscripcion />;
      case "asistencias":
        return (
          <div>
            <h2>Asistencias del alumno</h2>
            <pre>{JSON.stringify(asistenciasData, null, 2)}</pre>
            {/* Más adelante aquí podrías usar AsistenciasPanel */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="alumnos-page">
      {/* Sidebar */}
      <aside className="sidebar">
        {menuItems.map((it) => (
          <button
            key={it.id}
            className={`sb-item ${active === it.id ? "is-active" : ""}`}
            onClick={() => setActive(it.id)}
          >
            {it.label}
          </button>
        ))}
      </aside>

      {/* Área principal */}
      <main className="main-area">
        <div className="brand">
          <div className="brand__circle">
            <img src="/Logo.png" className="brand__logo" />
          </div>
          <h1>Instituto Superior Prisma</h1>
        </div>

        {renderPanel()}
      </main>
    </div>
  );
}
