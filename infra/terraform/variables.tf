variable "dockerhub_username" {
  description = "Usuario de Docker Hub que publica la imagen del backend"
  type        = string
}

variable "mysql_root_password" {
  description = "Password del usuario root de MySQL"
  type        = string
  sensitive   = true
  default     = "root"
}

variable "mysql_database" {
  description = "Nombre de la base de datos de la aplicación"
  type        = string
  default     = "prisma_app"
}

variable "mysql_user" {
  description = "Usuario de aplicación para MySQL"
  type        = string
  default     = "app"
}

variable "mysql_password" {
  description = "Password del usuario de aplicación para MySQL"
  type        = string
  sensitive   = true
  default     = "app"
}

variable "backend_port" {
  description = "Puerto donde escucha el backend dentro del contenedor"
  type        = number
  default     = 3000
}