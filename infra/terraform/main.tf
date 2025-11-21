terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# Red para aislar servicios
resource "docker_network" "app_net" {
  name = "pp4_app_network"
}

# Imagen de MySQL
resource "docker_image" "mysql" {
  name         = "mysql:8.4"
  keep_locally = false
}

# Contenedor de MySQL
resource "docker_container" "mysql" {
  name  = "pp4_mysql"
  image = docker_image.mysql.image_id

  env = [
    "MYSQL_ROOT_PASSWORD=${var.mysql_root_password}",
    "MYSQL_DATABASE=${var.mysql_database}",
    "MYSQL_USER=${var.mysql_user}",
    "MYSQL_PASSWORD=${var.mysql_password}",
  ]

  ports {
    internal = 3306
    external = 3307
  }

  networks_advanced {
    name = docker_network.app_net.name
  }

  mounts {
    target = "/docker-entrypoint-initdb.d"
    source = abspath("${path.module}/../../server/db/init")
    type   = "bind"
  }
}

# Imagen del backend desde Docker Hub
resource "docker_image" "backend" {
  name = "${var.dockerhub_username}/devops-backend:latest"
}

# Contenedor del backend
resource "docker_container" "backend" {
  name  = "pp4_backend"
  image = docker_image.backend.image_id

  env = [
    "PORT=${var.backend_port}",
    "DATABASE_URL=mysql://${var.mysql_user}:${var.mysql_password}@${docker_container.mysql.name}:3306/${var.mysql_database}",
    "DB_HOST=${docker_container.mysql.name}",
    "DB_USER=${var.mysql_user}",
    "DB_PASS=${var.mysql_password}",
    "DB_NAME=${var.mysql_database}",
    "CORS_ORIGIN=http://localhost:8080",
    "JWT_SECRET=supersecret",
  ]

  ports {
    internal = var.backend_port
    external = var.backend_port
  }

  networks_advanced {
    name = docker_network.app_net.name
  }

  depends_on = [docker_container.mysql]
}