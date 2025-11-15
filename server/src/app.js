import express from "express";
import morgan from "morgan";
import cors from "cors"; 

// 🔹 Importación de Rutas
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js"; 
import constanciasRoutes from "./routes/constancias.routes.js";
// 🚨 Importación corregida a 'gestionalumnos.routes.js'
import gestionAlumnosRouter from "./routes/gestionalumnos.routes.js"; 


const app = express();

// --- Middlewares ---
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// --- Rutas Base ---

// 🔹 Health Check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 🔹 CONEXIÓN DE RUTAS API 
app.use("/api/auth", authRoutes);

// Rutas de uso directo por rol:
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// 🚨 MONTAJE CLAVE: Montar el router de gestión bajo /api/gestion
app.use("/api/gestion", gestionAlumnosRouter); 

app.use("/api/ofertaAcademica", ofertaAcademicaRoutes); 
app.use("/api/constancias", constanciasRoutes); 

// 🔹 404 API Not Found
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

export default app;