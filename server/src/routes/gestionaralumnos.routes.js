import express from "express";
import { auth, allowRoles } from "../middleware/auth.js"; // Tus middlewares de JWT
import { getPerfilAlumno } from "../controllers/alumnoController.js"; // El controller que consulta MySQL

const router = express.Router();

// 💡 RUTA CLAVE PARA EL PERFIL DE ALUMNO
// Método: GET
// Path: /perfil (que, combinado con /api/alumnos, resulta en /api/alumnos/perfil)
router.get("/perfil", 
    auth,           // 1. Exige un JWT válido.
    allowRoles('alumno'), // 2. Verifica que el rol en el token sea 'alumno'.
    getPerfilAlumno // 3. Ejecuta la consulta a MySQL y devuelve el perfil.
);

// ... otras rutas de gestión de alumnos

export default router;