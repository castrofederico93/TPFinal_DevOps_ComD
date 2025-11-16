// src/pages/alumnos/AlumnosData.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api"; // Asumiendo que apiFetch está en src/lib/api

// Helper: capitalizar primera letra
export const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Helper para rol
const canonicalRole = (r = "") => {
  const v = String(r).toLowerCase();
  if (v === "administracion" || v === "administrativo") return "administrador";
  return v;
};

// Menú lateral
const menuItems = [
  { id: "perfil", label: "Mi Perfil" },
  { id: "inscripcion", label: "Inscripción a materias" },
  { id: "calificaciones", label: "Calificaciones" },
  { id: "historial", label: "Historial académico" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "asistencias", label: "Asistencias y Justificaciones" },
  { id: "calendario", label: "Calendario" },
  { id: "contacto", label: "Contacto" },
];

export const useAlumnosData = () => {
  const navigate = useNavigate();

  // ===============================
  // ESTADO GENERAL
  // ===============================
  const [active, setActive] = useState("perfil");
  const [alumno, setAlumno] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/alumno.jpg");

  const [showPwd, setShowPwd] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const fileRef = useRef(null);

  // ===============================
  // AUTENTICACIÓN / DATOS BÁSICOS
  // ===============================
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const userRole = canonicalRole(storedRole);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // ===============================
  // REDIRECCIÓN INICIAL (Solo Token y Rol)
  // ===============================
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    } else if (userRole !== "alumno") {
      alert(`Acceso denegado: Rol '${userRole}' no autorizado para esta vista.`);
      navigate("/", { replace: true });
    }
  }, [token, userRole, navigate]);

  // ===============================
  // CARGA DE PERFIL DEL ALUMNO (/me/datos)
  // ===============================
  useEffect(() => {
    if (!token || userRole !== "alumno") return;

    apiFetch(`/api/alumnos/me/datos`)
      .then((data) => {
        setAlumno(data);
      })
      .catch((err) => {
        console.error("Fallo al cargar perfil:", err);
        alert("No se pudo cargar el perfil del alumno.");
      });
  }, [userRole]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleLogout = () => {
    const ok = window.confirm("¿Seguro que deseas cerrar sesión?");
    if (!ok) return;

    localStorage.clear();
    navigate("/", { replace: true });
  };

  const choosePhoto = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (!pwd1 || !pwd2) {
      alert("Completá ambos campos.");
      return;
    }
    if (pwd1 !== pwd2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    alert("Contraseña actualizada (demo solo en front).");
    setShowPwd(false);
    setPwd1("");
    setPwd2("");
  };

  // ===============================
  // VALORES DEVUELTOS
  // ===============================
  return {
    active,
    setActive,
    alumno,
    avatarSrc,
    setAvatarSrc,
    showPwd,
    setShowPwd,
    pwd1,
    setPwd1,
    pwd2,
    setPwd2,
    fileRef,
    user: { ...user, role: userRole, username },
    items: menuItems,
    handleLogout,
    choosePhoto,
    onPhotoChange,
    savePassword,
  };
};
