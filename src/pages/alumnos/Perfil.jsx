// src/pages/alumnos/Perfil.jsx
import React from 'react';

// 🛑 ELIMINAMOS la definición de cap() aquí.
// La recibiremos como prop desde el hook (AlumnosData.js)

export default function PerfilPanel({
    setActive,
    alumno,
    avatarSrc,
    onPhotoChange,
    choosePhoto,
    fileRef,
    showPwd,
    setShowPwd,
    pwd1,
    setPwd1,
    pwd2,
    setPwd2,
    savePassword,
    cap // 💡 AÑADIMOS 'cap' a las props para que funcione.
}) {
    // Si 'cap' no se recibe como prop (por si acaso), lo definimos como fallback.
    const capitalize = cap || ((str = "") => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
    
    const displayName = alumno
        ? `${capitalize(alumno.nombre)} ${capitalize(alumno.apellido)}`
        : "—";

    const email = alumno?.email || "—";

    // Aseguramos que roles siempre sea un array válido.
    // Asumimos que el backend devuelve un string simple (ej: 'alumno').
    const roles = alumno?.rol ? [alumno.rol] : ["alumno"];

    return (
        <div className="profile-wrap">
            <div className="enroll-card profile-card">

                {/* HEADER */}
                <div className="enroll-header">
                    <h2 className="enroll-title">Mi Perfil</h2>
                    <button className="btn" onClick={() => setActive(null)}>
                        Volver
                    </button>
                </div>

                {/* GRID */}
                <div className="profile-grid">

                    {/* FOTO DE PERFIL */}
                    <div className="profile-col profile-col--avatar">
                        <img
                            src={avatarSrc}
                            alt={displayName}
                            className="profile-avatar-lg"
                        />

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            hidden
                        />

                        <button className="btn btn--success" onClick={choosePhoto}>
                            Cambiar foto de perfil
                        </button>
                    </div>

                    {/* INFO + CAMBIO DE CONTRASEÑA */}
                    <div className="profile-col profile-col--info">
                        <h3 className="profile-name">{displayName}</h3>
                        <div className="profile-email">{email}</div>

                        {!showPwd ? (
                            <div className="mt-16">
                                <button
                                    className="btn btn--danger"
                                    onClick={() => setShowPwd(true)}
                                >
                                    Cambiar contraseña
                                </button>
                            </div>
                        ) : (
                            <form
                                className="pwd-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    savePassword();
                                }}
                            >
                                <input
                                    type="password"
                                    className="grades-input"
                                    placeholder="Nueva contraseña"
                                    value={pwd1}
                                    onChange={(e) => setPwd1(e.target.value)}
                                />

                                <input
                                    type="password"
                                    className="grades-input"
                                    placeholder="Repetir contraseña"
                                    value={pwd2}
                                    onChange={(e) => setPwd2(e.target.value)}
                                />

                                <div className="row gap-12">
                                    <button className="btn btn--success" type="submit">
                                        Guardar
                                    </button>

                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => {
                                            setShowPwd(false);
                                            setPwd1("");
                                            setPwd2("");
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ROLES */}
                    <div className="profile-col profile-col--roles">
                        <h4 className="profile-subtitle">Roles</h4>
                        <ul className="profile-roles">
                            {roles.map((r) => (
                                <li key={r}>{capitalize(r)}</li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}