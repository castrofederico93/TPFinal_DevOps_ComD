import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Alumnos from "./pages/Alumnos.jsx";
import Preceptor from "./pages/Preceptor.jsx";
import Administrador from "./pages/Administrador.jsx";
import Docente from "./pages/Docente.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/alumno" element={<Alumnos />} />
        <Route path="/preceptor" element={<Preceptor />} />
        <Route path="/administrador" element={<Administrador />} />
        <Route path="/docente" element={<Docente />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}