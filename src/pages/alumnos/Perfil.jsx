// src/pages/alumnos/Perfil.jsx
import React from "react";
import { cap } from "./AlumnosData"; // Importamos el helper

export default function Perfil({
  alumno,
  avatarSrc,
  fileRef,
  choosePhoto,
  onPhotoChange,
  showPwd,
  setShowPwd,
  pwd1,
  setPwd1,
  pwd2,
  setPwd2,
  savePassword,
}) {
  if (!alumno) {
    return (
      <div className="panel-content">
        <h2>Mi Perfil</h2>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="panel-content perfil-panel">
      <h2>Mi Perfil</h2>
      <p className="panel-subtitle">Datos personales del alumno</p>

      <div className="perfil-grid">
        {/* Columna 1: datos básicos */}
        <div className="perfil-col">
          <h3>Datos del alumno</h3>
          <p>
            <strong>Nombre:</strong> {cap(alumno.nombre)} {cap(alumno.apellido)}
          </p>
          <p>
            <strong>DNI:</strong> {alumno.dni || "—"}
          </p>
          <p>
            <strong>Teléfono:</strong> {alumno.telefono || "—"}
          </p>
          <p>
            <strong>Email:</strong> {alumno.email || "—"}
          </p>
        </div>

        {/* Columna 2: avatar */}
        <div className="perfil-col">
          <h3>Foto de perfil</h3>
          <img src={avatarSrc} alt="Avatar" className="perfil-avatar" />
          <div className="perfil-avatar-actions">
            <button
              type="button"
              onClick={choosePhoto}
              className="btn-secondary"
            >
              Cambiar foto
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onPhotoChange}
            />
          </div>
          <p className="hint">
            (* Por ahora solo cambia en pantalla, a modo de demo)
          </p>
        </div>

        {/* Columna 3: contraseña */}
        <div className="perfil-col">
          <h3>Seguridad</h3>

          {!showPwd && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPwd(true)}
            >
              Cambiar contraseña
            </button>
          )}

          {showPwd && (
            <form onSubmit={savePassword} className="perfil-pwd-form">
              <label>
                Nueva contraseña
                <input
                  type="password"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                />
              </label>
              <label>
                Repetir contraseña
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
              </label>

              <div className="perfil-pwd-actions">
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
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
      </div>
    </div>
  );
}