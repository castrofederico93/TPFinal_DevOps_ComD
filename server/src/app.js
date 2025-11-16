// src/app.js

import express from "express";
import morgan from "morgan";
import cors from "cors"; 
import path from "path"; 

// 🔹 Importación de Rutas

// 🔑 RUTA PRINCIPAL DE ALUMNOS/GESTIÓN (Contiene /api/alumnos/me/datos)
import alumnosGestiónRoutes from "./routes/alumnos.routes.js"; 

// 💡 RUTA DE AUTENTICACIÓN
import authRoutes from "./routes/auth.routes.js"; 
// 💡 OTRAS RUTAS (Mantenemos si sabes que estos archivos existen)
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// ❌ RUTAS ELIMINADAS: Si confirmaste que borraste estos archivos, no deben importarse:
// import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js"; 
// import constanciasRoutes from "./routes/constancias.routes.js";
// (No incluir la que está fallando ahora: alumnoPerfil.routes.js)

const app = express();

// --- Middlewares ---

// 1. CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
}));

// 2. Manejo de JSON
app.use(express.json());

// 3. Registro de peticiones
app.use(morgan("dev"));

// 4. Servir archivos estáticos 
app.use(express.static('public')); 


// --- Rutas Base ---

// 🔹 Health Check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 🔹 CONEXIÓN DE RUTAS API 

app.use("/api/auth", authRoutes);

// 🔑 MONTAJE CRUCIAL DE ALUMNOS
app.use("/api/alumnos", alumnosGestiónRoutes); 

app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// 🔹 MONTAJE DE GESTIÓN (CRUD)
app.use("/api/gestion", alumnosGestiónRoutes); 

// ❌ QUITAR EL MONTAJE DE LAS RUTAS ELIMINADAS:
// app.use("/api/ofertaAcademica", ofertaAcademicaRoutes); 
// app.use("/api/constancias", constanciasRoutes); 

// 🔹 404 API Not Found
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

export default app;