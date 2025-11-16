// src/pages/alumnos/AlumnosRender.jsx
import React from "react";
import { useAlumnosData, cap } from "./AlumnosData";

// Importamos todos los paneles
import Perfil from "./Perfil";
import Inscripcion from "./Inscripcion";
import Calificaciones from "./Calificaciones";
import Historial from "./Historial";
import Notificaciones from "./Notificaciones";
import Asistencias from "./Asistencias";
import Calendario from "./Calendario";
import Contacto from "./Contacto";

export default function AlumnosRender() {
  // Obtenemos TODO del hook
  const {
    active,
    setActive,
    alumno,
    avatarSrc,
    user,
    items,
    handleLogout,
    // Props para el panel de Perfil
    ...perfilProps
  } = useAlumnosData();

  // ===============================
  // PANEL DINÁMICO GENERAL
  // ===============================
  const renderPanel = () => {
    switch (active) {
      case "perfil":
        return <Perfil alumno={alumno} avatarSrc={avatarSrc} {...perfilProps} />;
      case "inscripcion":
        return <Inscripcion />;
      case "calificaciones":
        return <Calificaciones />;
      case "historial":
        return <Historial />;
      case "notificaciones":
        return <Notificaciones />;
      case "asistencias":
        return <Asistencias />;
      case "calendario":
        return <Calendario />;
      case "contacto":
        return <Contacto />;
      default:
        return (
          <div className="panel-content">
            <h2>Panel no encontrado</h2>
          </div>
        );
    }
  };

  // ===============================
  // UI GENERAL
  // ===============================
  if (!user) {
    // por si se borra el localStorage en medio de la sesión
    return (
      <div className="alumnos-page">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="alumnos-page">
      {/* Fondo */}
      <div className="full-bg">
        <img src="/prisma.png" alt="Fondo" className="full-bg__image" />
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__inner">
          <div className="sb-profile">
            <button
              className="sb-gear"
              onClick={() => setActive("perfil")}
              title="Editar perfil"
            >
              <img src="/perfil.gif" alt="Editar perfil" />
            </button>

            <img src={avatarSrc} alt="Alumno" className="sb-avatar" />
            <p className="sb-role">Alumno/a</p>
            <p className="sb-name">
              {alumno ? (
                <>
                  {cap(alumno.nombre)} {cap(alumno.apellido)}
                </>
              ) : (
                "Cargando..."
              )}
            </p>
          </div>

          <div className="sb-menu">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setActive(it.id)}
                className={
                  "sb-item" + (active === it.id ? " is-active" : "")
                }
              >
                <span className="sb-item__icon" />
                <span className="sb-item__text">{it.label}</span>
              </button>
            ))}
          </div>

          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <span>Cerrar sesión</span>
              <span className="sb-logout-x">×</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Área principal */}
      <main className="main-area">
        {/* Marca */}
        <div className="brand">
          <div className="brand__circle">
            <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
          </div>
          <h1 className="brand__title">Instituto Superior Prisma</h1>
        </div>

        {/* Panel dinámico */}
        {renderPanel()}
      </main>
    </div>
  );
}