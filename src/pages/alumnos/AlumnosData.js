import { useState, useRef, useMemo, useEffect } from "react";

// *** AJUSTAR: Define cómo obtienes el JWT ***
const getToken = () => localStorage.getItem('token'); 
const API_URL = '/api/alumnos/perfil'; // Tu endpoint de Express

export const useAlumnoState = () => {
    // =================================================================
    // 💡 LÓGICA DE CARGA DEL PERFIL (MIGRADO DE JSON A MYSQL)
    // =================================================================
    const [alumno, setAlumno] = useState(null);
    const [loadingPerfil, setLoadingPerfil] = useState(true);
    const [errorPerfil, setErrorPerfil] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setErrorPerfil("Token no encontrado. Inicie sesión.");
            setLoadingPerfil(false);
            return;
        }

        const fetchPerfil = async () => {
            try {
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Envío del JWT
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al cargar perfil.');
                }

                const data = await response.json();
                
                // Establecer los datos obtenidos de MySQL
                setAlumno({
                    // Asegúrate de que los campos coincidan con lo que devuelve tu backend
                    id: data.id || 1, 
                    nombre: data.nombre,
                    apellido: data.apellido,
                    email: data.email, 
                    rol: data.rol
                });

            } catch (err) {
                console.error("Error al obtener perfil:", err);
                setErrorPerfil(err.message);
            } finally {
                setLoadingPerfil(false);
            }
        };

        fetchPerfil();
    }, []); 

    // =================================================================
    // ⚙️ PERFIL Y ESTADOS VARIOS
    // =================================================================
    const unreadCount = 5;
    const avatarSrc = "/alumno.jpg";
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const fileRef = useRef(null);
    const [showPwd, setShowPwd] = useState(false);
    const [pwd1, setPwd1] = useState("");
    const [pwd2, setPwd2] = useState("");

    // INSCRIPCIÓN
    const materiasDisponibles = [];
    const inscripto = [];
    const materiaById = (id) => ({ id, nombre: `Materia ${id}` });
    const showEnrollOk = false;

    // =================================================================
    // ✅ CALIFICACIONES (Corregido)
    // =================================================================
    const gradesData = [];
    const [gradeFilter, setGradeFilter] = useState("");
    const gradesFiltered = useMemo(() => gradesData, [gradeFilter]);

    // ✅ HISTORIAL (Corregido)
    const historial = [];

    // =================================================================
    // ✅ NOTIFICACIONES (Corregido)
    // =================================================================
    const notesData = [];
    const [notesMode, setNotesMode] = useState("all");
    const [noteFilter, setNoteFilter] = useState("");
    const [readSet, setReadSet] = useState(new Set());
    const [favSet, setFavSet] = useState(new Set());
    const [expanded, setExpanded] = useState(null);
    const notesAll = notesData;

    // ASISTENCIAS
    const asistencias = [];
    const resumen = { total: 10, ausentes: 2 };
    const jusList = [];
    const [jusForm, setJusForm] = useState({});
    const ESTADOS = { P: "Presente", A: "Ausente" };
    const MOTIVOS = { M: "Médico", O: "Otro" };

    // CALENDARIO
    const eventosData = [];
    const [calBase, setCalBase] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const y = calBase.getFullYear();
    const m = calBase.getMonth();
    const first = new Date(y, m, 1);
    const off = (first.getDay() + 6) % 7;
    const start = new Date(y, m, 1 - off);
    const eventosPorDia = useMemo(() => {
        const map = {};
        (eventosData || []).forEach((e) => {
            (map[e.fecha] ??= []).push(e);
        });
        return map;
    }, [eventosData]);

    const [diaSel, setDiaSel] = useState(null);

    // CONTACTO
    const contactoInst = { nombre: "Instituto Superior Prisma", direccion: "Calle Falsa 123" };
    const docentes = [];
    const [qContacto, setQContacto] = useState("");
    const docentesFiltrados = useMemo(() => {
        const q = qContacto.trim().toLowerCase();
        if (!q) return docentes;
        return docentes.filter((d) => {
            const base = [
                d.nombre,
                d.apellido,
                d.email,
                d.telefono,
                ...(d.materiasAsignadas || []).flatMap((m) => [m.nombre, m.comision, m.horario]),
            ]
                .filter(Boolean)
                .map(String)
                .map((s) => s.toLowerCase());
            return base.some((s) => s.includes(q));
        });
    }, [qContacto, docentes]);

    // =================================================================
    // RETORNO FINAL
    // =================================================================
    return {
        // PERFIL Y CARGA
        alumno,
        loadingPerfil, // Nuevo: para mostrar un spinner
        errorPerfil,   // Nuevo: para mostrar un error
        unreadCount,
        avatarSrc,
        cap,
        fileRef,
        showPwd,
        setShowPwd,
        pwd1,
        setPwd1,
        pwd2,
        setPwd2,
        
        // INSCRIPCIÓN
        materiasDisponibles,
        inscripto,
        materiaById,
        showEnrollOk,
        
        // CALIFICACIONES (Corregido)
        gradesFiltered,
        gradeFilter,
        setGradeFilter,
        
        // HISTORIAL (Corregido)
        historial,
        
        // NOTIFICACIONES (Corregido)
        notesAll,
        notesMode,
        setNotesMode,
        noteFilter,
        setNoteFilter,
        readSet,
        favSet,
        expanded,
        setExpanded,
        
        // ASISTENCIAS
        asistencias,
        resumen,
        jusList,
        jusForm,
        setJusForm,
        ESTADOS,
        MOTIVOS,
        
        // CALENDARIO
        eventosPorDia,
        calBase,
        setCalBase,
        start,
        m,
        diaSel,
        setDiaSel,
        
        // CONTACTO
        contactoInst,
        docentesFiltrados,
        qContacto,
        setQContacto,
    };
};