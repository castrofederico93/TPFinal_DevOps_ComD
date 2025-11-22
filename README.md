# PP4_PFO – Instituto Superior Prisma

PP4_PFO es una aplicación web full stack para la gestión académica de un instituto terciario.  
Incluye:

- **Backend**: API REST en **Node.js + Express** con **Prisma** sobre **MySQL**.
- **Frontend**: SPA en **React + Vite** con vistas diferenciadas para **Alumno**, **Docente**, **Preceptor** y **Administrador**.
- **DevOps**:
  - Contenerización con **Docker** y **Docker Compose**.
  - Pipeline de **CI/CD** con **GitHub Actions** + **Docker Hub** + **Railway**.
  - **Infraestructura como Código** con **Terraform** (provider Docker).
  - **Monitoreo** con **Prometheus + Grafana** y métricas expuestas en `/metrics`.

---

## 1. Objetivo y alcance

El objetivo es centralizar la gestión académica en un único sistema:

- Gestión de alumnos, docentes, preceptores y administrativos (a nivel académico).
- Administración de materias y comisiones.
- Registro y consulta de:
  - Inscripciones  
  - Asistencias  
  - Calificaciones  
  - Justificaciones  
  - Notificaciones y eventos de calendario  

### 1.1. Módulos principales implementados

- **Autenticación y autorización**
  - Login con usuario y contraseña (`/api/auth/login`).
  - JWT + middleware `auth` y `allowRoles` para proteger rutas por rol.

- **Alumno**
  - Perfil y datos académicos.
  - Comisiones, calificaciones, asistencias.
  - Justificaciones propias.
  - Notificaciones y calendario.

- **Docente**
  - Datos del docente.
  - Comisiones a cargo.
  - Soporte para carga de asistencias y calificaciones.

- **Preceptor**
  - Comisiones a cargo y métricas.
  - Registro/consulta de asistencias.
  - Gestión de justificaciones (aprobar/rechazar).
  - Comunicaciones a alumnos.
  - Notificaciones y calendario.

- **Administrativo / Gestión académica**
  - ABM de alumnos (registro académico).
  - Gestión de materias y comisiones.
  - Constancias e historial académico.
  - Comunicaciones institucionales.

---

## 2. Arquitectura de la aplicación

- **Estilo**: cliente–servidor, backend por capas y módulos de dominio.

### 2.1. Frontend (React + Vite)

- `src/pages`: vistas por rol (`Alumnos`, `Docente`, `Preceptor`, `Administrador`, `Login`, `Home`).
- `src/pages/alumnos`: vistas del alumno (perfil, inscripciones, asistencias, calificaciones, historial, contacto, notificaciones).
- `src/pages/docente`: vistas del docente (calendario, actas, asistencias, carga de notas, notificaciones).
- `src/pages/preceptor`: vistas del preceptor (alumnos, asistencias, justificaciones, comunicaciones, calendario, notificaciones, perfil).
- `src/components`: sidebars por rol, `ProtectedRoute`, configuración de navegación (`navConfig.js`).
- `src/lib`: wrapper HTTP (`api.js`) y clientes de API por dominio (`alumnos.api.js`, `preceptor.api.js`, `docente.api.js`, etc.).

### 2.2. Backend (Node.js + Express)

- `server/src/app.js`: configuración de Express, middlewares generales y rutas principales.
- `server/src/server.js`: arranque de la API.
- `server/src/routes/*.routes.js`: rutas agrupadas por dominio:
  - `auth.routes.js`, `alumnos.routes.js`, `preceptores.routes.js`,
  - `calendarioDocente.routes.js`, `notificaciones.routes.js`,
  - `ofertaAcademica.routes.js`, `admin.routes.js`, etc.
- `server/src/controllers/*.controller.js`: lógica de cada caso de uso (alumnos, asistencias, justificaciones, calendario, auth, etc.).
- `server/src/services/*.service.js`: lógica de dominio reutilizable (alumnos, auth, userAccount).
- `server/src/db/prisma.js`: instancia de `PrismaClient`.
- `server/src/middlewares`: autenticación (`auth.js`, `auth.middleware.js`), subida de archivos (`uploadAvatar.js`).
- `server/src/metrics/metrics.js`: definición de métricas Prometheus y middleware de medición.

### 2.3. Base de datos (MySQL)

- Esquema normalizado con tablas, entre otras:
  - `usuarios`, `roles`,
  - `alumnos`, `docentes`, `preceptores`,
  - `materias`, `comisiones`,
  - `inscripciones`, `asistencias`, `calificaciones`, `justificaciones`,
  - `notificaciones`, `eventos`, `instituto`, `preceptor_comision`.
- SQL inicial: `server/db/init/01_full.sql`.
- Modelo Prisma: `server/prisma/schema.prisma`.
- Migraciones: `server/prisma/migrations/*`.

---

## 3. Estado del proyecto y limitaciones

> ⚠️ El sistema está en **desarrollo / preproducción**.

- No existe un flujo completo de **alta de usuarios** desde la interfaz:
  - No hay pantalla de registro.
  - No hay endpoints públicos para crear usuarios.
- Los usuarios que pueden iniciar sesión deben estar **precargados en la BD**:
  - La tabla `usuarios` (y sus vínculos con `alumnos`, `docentes`, `preceptores`, etc.) se llena vía SQL o scripts (`server/scripts/migrate_from_json.js`).
- Conviven partes “viejas” y “nuevas”:
  - Uso residual de `src/data/*.json` en el frontend (en proceso de reemplazo por API real).
  - Algunos middlewares y rutas de notificaciones están en proceso de consolidación.

Líneas de trabajo futuro:

- Completar módulo de gestión de usuarios (alta, baja, cambio de rol) y vistas de administración.
- Unificar middlewares de autenticación y routers de notificaciones.
- Eliminar dependencias de JSON locales en producción.
- Mejorar validaciones, manejo de errores y UX.

---

## 4. Tecnologías principales

### 4.1. Backend

- Node.js, Express  
- Prisma ORM (`@prisma/client`)  
- MySQL  
- JWT (`jsonwebtoken`), `bcryptjs`  
- Middlewares: `cors`, `morgan`, `multer`  
- Configuración: `dotenv`, `server/src/config/env.js`  

### 4.2. Frontend

- React (hooks), Vite  
- React Router DOM  
- Wrapper `fetch` propio (`src/lib/api.js`)  
- Generación de PDFs (constancias): `jspdf`, `jspdf-autotable`, `html2pdf.js`  
- Estilos CSS modulares por sección  

### 4.3. DevOps

- Docker y Docker Compose.
- GitHub Actions (CI/CD).
- Docker Hub (registro de imágenes).
- Railway (despliegue en la nube).
- Terraform (provider Docker) para IaC local.
- Prometheus + Grafana para monitoreo.

---

## 5. Puesta en marcha rápida

### 5.1. Clonar el repositorio

```bash
git clone https://github.com/castrofederico93/TPFinal_DevOps_ComD.git
cd TPFinal_DevOps_ComD
```

---

### 5.2. Ejecución con Docker Compose (recomendado)

En la raíz del proyecto se encuentra `docker-compose.yml` con cinco servicios:

- `db`: MySQL 8.4 con carga inicial desde `server/db/init/01_full.sql`.
- `api`: backend Node.js (carpeta `server`).
- `frontend`: aplicación React (raíz del proyecto).
- `prometheus`: servidor de métricas Prometheus.
- `grafana`: interfaz de visualización para dashboards de monitoreo.

#### 5.2.1. Levantar el stack

```bash
docker compose up -d --build
# o, según tu versión:
# docker-compose up -d --build
```

Esto:

- Construye la imagen del backend y del frontend.
- Levanta la base de datos MySQL.
- Ejecuta automáticamente los scripts de `server/db/init/` dentro del contenedor de MySQL.
- Levanta Prometheus y Grafana conectados al backend.

#### 5.2.2. Puertos por defecto

- Backend (API): `http://localhost:3000`
- Frontend: `http://localhost:8080`
- MySQL: `localhost:3307` (host) → `3306` (contendor)
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

La API se expone bajo `/api/*`.  
El frontend utiliza la API configurando `VITE_API_BASE` hacia `http://localhost:3000/api`.

Para detener los servicios:

```bash
docker compose down
# o docker-compose down
```

---

### 5.3. Ejecución local sin Docker (modo manual)

#### 5.3.1. Backend

1. Crear base de datos MySQL (por ejemplo `prisma_app`).
2. Importar el esquema inicial:

   - Usar un cliente MySQL (Workbench, CLI) para importar `server/db/init/01_full.sql`.

3. Configurar variables de entorno en `server/.env` (basado en `server/.env.example`):

```env
PORT=3000
JWT_SECRET=supersecret
DATABASE_URL="mysql://app:app@localhost:3306/prisma_app"

DB_HOST=localhost
DB_USER=app
DB_PASS=app
DB_NAME=prisma_app
CORS_ORIGIN=http://localhost:5173
```

4. Instalar dependencias y levantar el backend:

```bash
cd server
npm install
npm run dev    # o npm start, según scripts configurados
```

#### 5.3.2. Frontend

En la raíz del proyecto:

```bash
npm install
npm run dev
```

Crear un archivo `.env` en la raíz:

```env
VITE_API_BASE=http://localhost:3000/api
```

El frontend se ejecutará típicamente en `http://localhost:5173`.

---

## 6. Pruebas (frontend)

El frontend cuenta con pruebas automatizadas sobre las vistas principales de **Docente** y **Preceptor**.

### 6.1. Frameworks utilizados

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

Scripts relevantes en `package.json` (raíz):

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

### 6.2. Ejecutar pruebas localmente

Desde la raíz del proyecto:

```bash
npm install      # si es la primera vez
npm test         # ejecuta todas las pruebas en modo consola
```

### 6.3. Cobertura actual de pruebas

Las pruebas abarcan, entre otras:

- **Docente**
  - `CargarNotas`: render de alumnos iniciales y lógica de búsqueda/filtrado.
  - `Asistencia`: marcado masivo de presentes y desmarcado.
  - `Acta`: guardado de acta y confirmación.
  - `Notificaciones`: marcado de favoritas y filtro de notificaciones.

- **Preceptor**
  - `PreceptorAsistencia`: cambio de estado de asistencia por alumno.
  - `PreceptorNotificaciones`: filtros y favoritos.
  - `PreceptorPerfil`: cambio de contraseña y actualización de datos básicos.

`npm test` muestra en consola el resumen de suites y tests ejecutados e informa cualquier fallo.

---

## 7. Usuarios de prueba

En el estado actual, solo se puede ingresar con usuarios precargados en la tabla `usuarios`.  
Ejemplos típicos (según el SQL inicial):

- `alumno1` / `1111` – rol Alumno  
- `docente2` / `2222` – rol Docente  
- `administrativo3` / `3333` – rol Administrativo  
- `preceptor4` / `4444` – rol Preceptor  

Las contraseñas se guardan como hash `bcrypt` en la base de datos.

---

## 8. DevOps: CI/CD con GitHub Actions + Docker Hub + Railway

### 8.1. Pipeline de CI/CD (`.github/workflows/ci.yml`)

El workflow `CI/CD DevOps` se ejecuta en:

- `push` a la rama `main`.
- `pull_request` hacia `main`.

Pasos principales:

1. **Checkout y Node.js**
   - `actions/checkout@v4`.
   - `actions/setup-node@v4` con Node 20.

2. **CI (tests de frontend)**
   - Instalación de dependencias en la raíz:
     ```bash
     npm ci
     ```
   - Ejecución de pruebas:
     ```bash
     npm test
     ```

3. **Build y push de imágenes Docker (solo en push a `main`)**
   - Login a Docker Hub usando `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` desde **GitHub Secrets**.
   - **Backend**:
     - Build: `docker build -t $DOCKERHUB_USERNAME/devops-backend:latest ./server`
     - Push: `docker push $DOCKERHUB_USERNAME/devops-backend:latest`
   - **Frontend**:
     - Build: `docker build -t $DOCKERHUB_USERNAME/devops-frontend:latest .`
     - Push: `docker push $DOCKERHUB_USERNAME/devops-frontend:latest`

De esta forma:

- La **integración continua (CI)** garantiza que las pruebas del frontend se ejecuten en cada cambio.
- La **entrega continua (CD)** sube automáticamente las imágenes actualizadas al registro de Docker Hub cuando se mergea a `main`.

### 8.2. Despliegue en Railway (entorno de prueba)

La aplicación está desplegada en **Railway** como entorno de prueba:

- URL: **https://impartial-reflection-production-1d5c.up.railway.app/**

Railway está configurado para:

- Conectarse al repositorio de GitHub.
- Desplegar automáticamente una nueva versión cuando hay cambios en la rama `main`.

Flujo completo:

1. Desarrollador hace `git push` a `main`.
2. GitHub Actions:
   - Ejecuta tests de frontend.
   - Construye y pushea imágenes Docker (`devops-backend` y `devops-frontend`).
3. Railway:
   - Detecta el nuevo commit en `main`.
   - Reconstruye y redepliega la app en el entorno de prueba.

---

## 9. Monitoreo: Prometheus + Grafana

Para el punto de monitoreo del TP se implementó:

- Exposición de métricas en formato Prometheus en el backend (`/metrics`), usando `prom-client`.
- Scraping periódico de esas métricas con un contenedor Prometheus.
- Visualización en tiempo real mediante Grafana.

### 9.1. Métricas expuestas por el backend

En `server/src/metrics/metrics.js` se definen:

- Métricas estándar de Node.js (CPU, memoria, heap, GC, event loop, etc.) mediante `collectDefaultMetrics`.
- Un **histograma de duración de requests HTTP**:

  - Nombre: `http_request_duration_ms`
  - Labels: `method`, `route`, `status_code`
  - Buckets en milisegundos: `[50, 100, 200, 300, 400, 500, 1000, 2000]`

El middleware `metricsMiddleware` mide todas las requests y el endpoint `/metrics` expone las métricas para Prometheus.

### 9.2. Configuración de Prometheus

Archivo: `infra/monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "pp4-backend"
    metrics_path: /metrics
    static_configs:
      - targets: ["api:3000"]
```

- `api:3000` es el servicio del backend dentro de la red `app-net`.
- Cada 15 segundos Prometheus lee las métricas de `/metrics`.

### 9.3. Dashboards en Grafana

Con todo el stack levantado (`docker compose up -d --build`):

- Prometheus: `http://localhost:9090`  
- Grafana: `http://localhost:3001`

En Grafana:

1. Se configura un **Data Source** Prometheus apuntando a `http://prometheus:9090`.
2. Se crean dashboards con queries típicas, por ejemplo:
   - Cantidad de requests por endpoint:
     ```promql
     http_request_duration_ms_count
     ```
   - Requests por segundo:
     ```promql
     rate(http_request_duration_ms_count[1m])
     ```
   - Latencia P95:
     ```promql
     histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le))
     ```

Esto permite monitorear el comportamiento del backend (latencias, volumen de requests, etc.) dentro del entorno de Docker Compose.

> En Railway solo se despliega la API (no Prometheus ni Grafana), pero el endpoint `/metrics` queda disponible para un futuro monitoreo en la nube.

---

## 10. Infraestructura como Código (IaC) con Terraform

Para el entorno local, se incluyó una definición de infraestructura basada en **Terraform** (provider Docker), que permite recrear de forma declarativa la red, la base de datos y el backend.

### 10.1. Estructura

Carpeta:

```text
infra/
  terraform/
    main.tf
    variables.tf
    terraform.tfvars.example
```

### 10.2. Recursos definidos

En `main.tf` se declaran:

- `docker_network.app_net`: red Docker `pp4_app_network`.
- `docker_image.mysql` + `docker_container.mysql`:
  - Imagen `mysql:8.4`.
  - Base de datos con variables de entorno:
    - `MYSQL_ROOT_PASSWORD`
    - `MYSQL_DATABASE`
    - `MYSQL_USER`
    - `MYSQL_PASSWORD`
  - Puerto publicado: `3307` en el host.
  - Montaje de `server/db/init` en `/docker-entrypoint-initdb.d` para ejecutar `01_full.sql` al iniciar.
- `docker_image.backend` + `docker_container.backend`:
  - Imagen `DOCKERHUB_USERNAME/devops-backend:latest` obtenida desde Docker Hub.
  - Variables de entorno:
    - `PORT`
    - `DATABASE_URL`
    - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
    - `CORS_ORIGIN`, `JWT_SECRET`
  - Puerto publicado: `3000` en el host.
  - Conectado a la red `pp4_app_network`.

### 10.3. Configuración de variables

En `variables.tf` se declaran las variables necesarias y sus valores por defecto.  
Ejemplo de `terraform.tfvars.example`:

```hcl
dockerhub_username   = "tu_usuario_dockerhub"
mysql_root_password  = "root"
mysql_database       = "prisma_app"
mysql_user           = "app"
mysql_password       = "app"
backend_port         = 3000
```

Para usarlo:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# editar terraform.tfvars con tus valores reales (usuario de Docker Hub, etc.)
```

### 10.4. Comandos básicos

Requisitos:

- Docker instalado y corriendo.
- Imagen `devops-backend:latest` disponible en Docker Hub bajo el usuario configurado.

Desde `infra/terraform`:

```bash
# Inicializar Terraform (descarga provider Docker)
terraform init

# Ver el plan de cambios
terraform plan

# Crear la infraestructura (red + MySQL + backend)
terraform apply
# escribir "yes" para confirmar
```

Para destruir la infraestructura creada:

```bash
terraform destroy
# escribir "yes" para confirmar
```

Con esto, se demuestra el uso de **Infraestructura como Código (IaC)** para describir y levantar el entorno backend+BD de forma reproducible en cualquier máquina con Docker y Terraform.

---

## 11. Conclusión

Este proyecto combina:

- Una aplicación web real (backend + frontend + base de datos).
- Contenerización con Docker y orquestación con Docker Compose.
- Pipeline de CI/CD con GitHub Actions, Docker Hub y Railway.
- Infraestructura como Código con Terraform (provider Docker).
- Monitoreo de la API con métricas Prometheus y visualización en Grafana.

Todo esto se integra como **Trabajo Práctico Integrador de DevOps**, cubriendo desarrollo, pruebas automatizadas, build de imágenes, despliegue automatizado en la nube, definición declarativa de la infraestructura y monitoreo del sistema.