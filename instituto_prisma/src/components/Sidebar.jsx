import React from "react";
import { FaHome, FaUser, FaCog } from "react-icons/fa";

export default function Sidebar() {
  const menuItems = [
    { icon: <FaHome />, text: "Inicio" },
    { icon: <FaUser />, text: "Perfil" },
    { icon: <FaCog />, text: "Configuración" },
  ];

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        background: "linear-gradient(180deg, #2b2b40, #1e1e2f)",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2 style={{ marginBottom: "30px", fontSize: "20px" }}>Instituto Prisma</h2>

      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map((item) => (
            <li
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 0",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3a3a5a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.icon}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
