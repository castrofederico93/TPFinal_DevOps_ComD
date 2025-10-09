import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


    // Funciones para redirigir
  const handleIngresarAlumnos = () => {
    navigate("/alumnos");
  };

  const handleIngresarDocente = () => {
    navigate("/docente");
  };

  const handleIngresarAdministracion = () => {
    navigate("/administracion");
  };

  const handleIngresarPreceptor = () => {
    navigate("/preceptor");
  };

  return (
    <div className="home-container">
      <div className="login-box">
        <h2>Ingreso al Sistema</h2>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handleIngresarAlumnos}>Ingresar Alumnos</button>
          <button onClick={handleIngresarDocente}>Ingresar Docente</button>
          <button onClick={handleIngresarAdministracion}>Ingresar Administración</button>
          <button onClick={handleIngresarPreceptor}>Ingresar Preceptor</button>

        </div>
      </div>
    </div>
  );
}