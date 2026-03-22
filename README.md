# Image Hosting Server

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639)
![Status](https://img.shields.io/badge/Project-Completed-success)

A containerized image hosting service built with **Python**, **PostgreSQL**, **Nginx**, and **Docker Compose**.

The application allows users to upload images, store metadata in a PostgreSQL database, browse uploaded files, delete images, and create database backups. Static files and uploaded images are served through **Nginx**, while the backend is responsible for validation, metadata management, and API logic.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the Project](#run-the-project)
- [Usage Flow](#usage-flow)
- [Routes and API](#routes-and-api)
- [Database](#database)
- [Backups](#backups)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## Overview

This project is an **Image Hosting Server 2.0** that extends a basic upload service with:

- persistent image storage using Docker volumes;
- metadata storage in PostgreSQL;
- image listing with pagination;
- image deletion by database ID;
- Nginx-based static file delivery;
- database backup and restore support.

It was built as a learning project focused on:
- backend fundamentals with Python;
- working with Docker and Docker Compose;
- integrating PostgreSQL into a web application;
- handling static files and reverse proxy configuration with Nginx.

---

## Features

- Upload `.jpg`, `.jpeg`, `.png`, and `.gif` images
- File size validation (up to **5 MB**)
- Unique filename generation for uploaded files
- Static image delivery through `/images/<filename>`
- Metadata persistence in PostgreSQL
- Image list page with pagination (**10 items per page**)
- Delete image by ID
- Dockerized development and deployment setup
- Shared Docker volumes for images, logs, and backups
- Nginx reverse proxy for backend and static content
- Backup creation, listing, and restore script

---

## Tech Stack

**Backend**
- Python 3.12
- Standard library HTTP server
- Pillow
- psycopg2
- python-dotenv

**Infrastructure**
- Docker
- Docker Compose
- PostgreSQL 15
- Nginx

**Frontend**
- HTML
- CSS
- JavaScript (vanilla)

---

## Architecture

The project consists of three main services:

### `app`
Python backend application that:
- accepts uploads;
- validates images;
- saves files to the shared `/images` volume;
- stores metadata in PostgreSQL;
- exposes routes for listing and deleting images.

### `db`
PostgreSQL database used to store metadata such as:
- image ID;
- filename;
- original filename;
- file size;
- file type;
- upload timestamp.

### `nginx`
Acts as:
- reverse proxy for the Python backend;
- static file server for `/images/`;
- static asset server for `/static/`.

---

## Project Structure

```text
.
├── config/
│   ├── init.sql
│   └── nginx.conf
├── scripts/
│   └── backup.py
├── src/
│   ├── static/
│   │   ├── css/
│   │   ├── img/
│   │   └── js/
│   ├── templates/
│   │   ├── images.html
│   │   ├── index.html
│   │   └── upload.html
│   ├── app.py
│   ├── database.py
│   ├── file_handler.py
│   └── validators.py
├── compose.yaml
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## Getting Started

### Requirements

Make sure you have installed:

- Docker
- Docker Compose

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=image_hosting_server_db
DB_USER=postgres
DB_PASSWORD=postgres
BACKUP_DIR=./backups
DB_CONTAINER_NAME=image-hosting-server-db-1
```

> The exact database container name may differ depending on your Docker Compose project name.  
> You can check it with:

```bash
docker compose ps
```

---

## Run the Project

Build and start all containers:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

Remove containers and volumes:

```bash
docker compose down -v
```

---

## Usage Flow

### 1. Open the app
After startup, open:

```text
http://localhost:8080
```

### 2. Upload an image
Go to:

```text
http://localhost:8080/upload
```

Choose a supported image file and upload it.

### 3. Copy the generated image URL
The application returns a public path like:

```text
/images/<generated-filename>.png
```

### 4. Browse uploaded images
Open:

```text
http://localhost:8080/images-list
```

You will see:
- preview image;
- filename;
- URL;
- delete button;
- pagination controls.

### 5. Delete an image
Delete actions are performed by image ID through the backend.

---

## Routes and API

### Pages

| Route | Description |
|------|-------------|
| `/` | Main page |
| `/upload` | Upload page |
| `/images-list` | Uploaded images page |

### Backend/API

| Route | Method | Description |
|------|--------|-------------|
| `/upload` | `POST` | Upload image |
| `/api/images-list?page=1` | `GET` | Return paginated image list |
| `/delete/<id>` | `POST` | Delete image by ID |

### Static

| Route | Description |
|------|-------------|
| `/images/<filename>` | Serve uploaded image |
| `/static/...` | Serve frontend static assets |

---

## Database

The PostgreSQL database contains an `images` table initialized from `config/init.sql`.

### Table fields

- `id`
- `filename`
- `original_name`
- `size`
- `file_type`
- `upload_time`

---

## Backups

The project includes `scripts/backup.py` for database backup management.

### Create a backup

```bash
python scripts/backup.py create
```

### List backups

```bash
python scripts/backup.py list
```

### Restore a backup

```bash
python scripts/backup.py restore backup_YYYY-MM-DD_HHMMSS.sql
```

Backups are stored in:

```text
./backups
```

---

## Troubleshooting

### Images are not displayed
Check that:
- the `images` Docker volume is mounted in both `app` and `nginx`;
- Nginx has a valid `location /images/` block;
- files are actually written to `/images`.

Useful commands:

```bash
docker compose exec app ls -la /images
docker compose exec nginx ls -la /images
```

### Upload fails
Check:
- file type and size;
- database connection;
- backend logs.

```bash
docker compose logs app
```

### Database connection error
Verify:
- `.env` values;
- PostgreSQL container status;
- database availability.

```bash
docker compose ps
docker compose logs db
```

### Backup script cannot find container
Check the real container name:

```bash
docker compose ps
```

Then update `DB_CONTAINER_NAME` in `.env` if needed.

---

## Future Improvements

Possible next steps for this project:

- drag-and-drop multi-file upload;
- image search and filtering;
- authentication and user accounts;
- file type detection based on actual content;
- automated tests;
- CI/CD pipeline;
- cloud storage integration (AWS S3, Cloudinary, etc.);
- REST API documentation.

---

## Author

Created as a backend/Docker/PostgreSQL learning project.
