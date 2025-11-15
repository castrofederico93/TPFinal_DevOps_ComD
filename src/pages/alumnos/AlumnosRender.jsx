// src/pages/Alumnos/renderPanel.js
import React from "react";
import PerfilPanel from "./Perfil";
import InscripcionPanel from "./Inscripcion";
import CalificacionesPanel from "./Calificaciones";





import HistorialPanel from "./Historial";
import NotificacionesPanel from "./Notificaciones";
import AsistenciasPanel from "./Asistencias";
import CalendarioPanel from "./Calendario";
import ContactoPanel from "./Contacto";

export const renderPanel = (active, setActive, state) => {
  switch (active) {
    case "perfil":
      return <PerfilPanel setActive={setActive} {...state} />;
    case "inscripcion":
      return <InscripcionPanel setActive={setActive} {...state} />;
    case "calificaciones":
      return <CalificacionesPanel setActive={setActive} {...state} />;
    case "historial":
      return <HistorialPanel setActive={setActive} {...state} />;
    case "notificaciones":
      return <NotificacionesPanel setActive={setActive} {...state} />;
    case "asistencias":
      return <AsistenciasPanel setActive={setActive} {...state} />;
    case "calendario":
      return <CalendarioPanel setActive={setActive} {...state} />;
    case "contacto":
      return <ContactoPanel setActive={setActive} {...state} />;
    default:
      return null;
  }
};
