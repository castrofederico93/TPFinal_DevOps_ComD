// src/pages/Alumnos.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlumnoState } from "./alumnos/AlumnosData.js";
import { renderPanel } from "./alumnos/AlumnosRender";
// import LoadingSpinner from '../components/LoadingSpinner'; // Suponiendo que tienes un spinner

const items = [
    { id: "perfil", label: "Perfil" },
    { id: "inscripcion", label: "Inscripción" },
    { id: "calificaciones", label: "Calificaciones" },
    { id: "historial", label: "Historial" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "asistencias", label: "Asistencias" },
    { id: "calendario", label: "Calendario" },
    { id: "contacto", label: "Contacto" },
];

// Función temporal para manejar el cambio de contraseña (la lógica real iría aquí)
const handleSavePassword = () => {
    // Aquí iría la lógica para llamar a la API y guardar la nueva contraseña
    console.log("Intentando guardar nueva contraseña...");
    alert("Funcionalidad de guardar contraseña pendiente de implementar en la API.");
};

export default function Alumnos() {
    const navigate = useNavigate();
    const [active, setActive] = useState(null);
    const state = useAlumnoState();

    // 1. Manejo de estados de Carga y Error de MySQL ⏳
    if (state.loadingPerfil) {
        return (
            <div className="loading-overlay">
                Cargando datos del perfil desde MySQL...
                {/* <LoadingSpinner /> */}
            </div>
        );
    }

    if (state.errorPerfil) {
        return (
            <div className="error-message">
                Error al cargar el perfil: **{state.errorPerfil}**.
                <p>Verifique la conexión al backend y la validez del token JWT.</p>
            </div>
        );
    }

    // Datos del alumno (garantizados después de pasar la carga/error)
    const alumno = state.alumno || {};
    const displayName = `${state.cap(alumno.nombre)} ${state.cap(alumno.apellido)}`;
    const roleName = state.cap(alumno.rol || 'alumno/a');

    return (
        <div className="alumnos-page">
            <div className="full-bg">
                <img src="/prisma.png" alt="Fondo" className="bg-img" />
            </div>

            <aside className="sidebar">
                <div className="sidebar__inner">
                    <div className="sb-profile">
                        <button className="sb-gear" onClick={() => setActive("perfil")}>
                            <img src="/perfil.gif" alt="Config" />
                        </button>
                        {/* 2. Mostrar datos dinámicos del alumno obtenidos de MySQL */}
                        <img src={state.avatarSrc} alt="Avatar" className="sb-avatar" />
                        <p className="sb-role">{roleName}</p>
                        <p className="sb-name">{displayName}</p>
                    </div>
                    <div className="sb-menu">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                className={"sb-item" + (active === it.id ? " is-active" : "")}
                                onClick={() => setActive(it.id)}
                            >
                                <span className="sb-item__text">{it.label}</span>
                                {it.id === "notificaciones" && state.unreadCount > 0 && (
                                    <span className="counter">{state.unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="sb-footer">
                        <button className="sb-logout" onClick={() => navigate("/login")}>
                            cerrar sesión ×
                        </button>
                    </div>
                </div>
            </aside>

            <div className="brand">
                <div className="brand__circle">
                    <img src="/Logo.png" alt="Logo Prisma" className="brand__logo" />
                </div>
                <h1 className="brand__title">Instituto Superior Prisma</h1>
            </div>

            {/* 3. Renderizar Panel, pasando 'savePassword' y 'cap' */}
            {renderPanel(active, setActive, { ...state, savePassword: handleSavePassword })}
        </div>
    );
}