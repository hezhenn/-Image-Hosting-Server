# 🖼️ Image Hosting Server

A containerized image hosting service built with <b>Python</b>, <b>PostgreSQL</b>, <b>Nginx</b>, and <b>Docker Compose</b>.

The project supports image uploads, metadata storage, gallery browsing, image deletion, and database backups.

---

## 🛠️ Tech Stack

### Backend
<p>
  <img src="https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/http.server-Standard%20Library-lightgrey?style=flat-square" alt="http.server">
  <img src="https://img.shields.io/badge/Pillow-Image%20Processing-orange?style=flat-square" alt="Pillow">
  <img src="https://img.shields.io/badge/psycopg2-PostgreSQL%20Driver-336791?style=flat-square" alt="psycopg2">
  <img src="https://img.shields.io/badge/python--dotenv-Environment%20Config-yellowgreen?style=flat-square" alt="python-dotenv">
</p>

### Frontend
<p>
  <img src="https://img.shields.io/badge/HTML-Markup-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML">
  <img src="https://img.shields.io/badge/CSS-Styling-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
</p>

### Infrastructure
<p>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?style=flat-square&logo=nginx" alt="Nginx">
</p>

---

## ✨ Overview

**Image Hosting Server** is a small full-stack web application designed to handle image uploads in a clean, structured, and Dockerized environment.

It extends a basic upload service with:

- persistent image storage through Docker volumes
- PostgreSQL metadata storage
- paginated image browsing
- image deletion by database ID
- static file delivery via Nginx
- backup and restore support for the database

This project was created as a practical learning exercise focused on:

- backend development with Python
- Docker and Docker Compose workflows
- PostgreSQL integration
- file handling and validation
- reverse proxy and static file serving with Nginx

---

## 🚀 Features

- Upload `.jpg`, `.jpeg`, `.png`, and `.gif` images
- Validate uploaded files (up to **5 MB**)
- Generate unique filenames for safe storage
- Serve uploaded files through `/images/<filename>`
- Store image metadata in PostgreSQL
- Browse uploaded images on a separate page
- Paginate the gallery (**10 images per page**)
- Delete images by ID
- Run the full stack with Docker Compose
- Use shared Docker volumes for images, logs, and backups
- Reverse proxy backend and static content with Nginx
- Create, list, and restore database backups

---

## 🏗️ Architecture

The project consists of three main services:

### `app`
The Python backend application:
- handles image uploads
- validates files
- stores uploaded images in the shared `/images` volume
- saves metadata in PostgreSQL
- provides routes for listing and deleting images

### `db`
The PostgreSQL database stores metadata such as:
- image ID
- filename
- original filename
- file size
- file type
- upload timestamp

### `nginx`
Nginx is responsible for:
- reverse proxying requests to the backend
- serving uploaded images from `/images/`
- serving frontend static assets from `/static/`

---

## 📁 Project Structure

```text
image-hosting-server/
├── backups/
├── config/
│   ├── init.sql
│   └── nginx.conf
├── images/
├── scripts/
│   └── backup.py
├── src/
│   ├── app.py
│   ├── database.py
│   ├── file_handler.py
│   ├── validators.py
│   ├── static/
│   │   ├── css/
│   │   ├── img/
│   │   └── js/
│   └── templates/
│       ├── index.html
│       ├── upload.html
│       └── images.html
├── .env
├── .env.example
├── .gitignore
├── compose.yaml
├── Dockerfile
├── requirements.txt
└── README.md
```
## ⚙️ How It Works

1. The user uploads an image from the `/upload` page.
2. The Python backend validates the file and saves it into the `/images` Docker volume.
3. Metadata is saved to PostgreSQL in the `images` table.
4. Nginx serves uploaded files from `/images/<filename>`.
5. The gallery page requests metadata from `/api/images-list?page=<n>` and renders a paginated list.
6. Images can be deleted through `/delete/<id>`.

## 📦 Requirements

- Docker
- Docker Compose

## 🔐 Environment Variables

Create a `.env` file in the project root. You can use `.env.example` as a template.

Example:

```env
# Database Configuration
DB_HOST=db
DB_NAME=image_hosting_server
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432

# Server Configuration
PORT=8000

# PostgreSQL Docker Configuration
POSTGRES_DB=image_hosting_server
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

Optional variables for the backup script:

```env
BACKUP_DIR=./backups
DB_CONTAINER_NAME=imagehostingserver-db-1
```

## 🚀 Running the Project

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd image-hosting-server
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your values.

### 3. Start the application

```bash
docker compose up --build
```

To run in detached mode:

```bash
docker compose up --build -d
```

### 4. Open the application

- 🏠Main page: `http://localhost:8080/`
- 📤Upload page: `http://localhost:8080/upload`
- 🖼️Images gallery: `http://localhost:8080/images-list`

## 🌍 API and Routes

### Pages

- `GET /` — home page
- `GET /upload` — upload page
- `GET /images-list` — image gallery page

### API

- `POST /upload` — upload an image
- `GET /api/images-list?page=1` — get paginated image metadata
- `POST /delete/<id>` — delete image metadata and file by ID

### Static and media

- `GET /static/...` — frontend assets
- `GET /images/<filename>` — uploaded image served by Nginx

## 🗄️ Database Schema

The application creates the following table on startup:

```sql
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📄 Pagination

The gallery uses server-side pagination:

- Default page size: **10 images per page**
- Backend pagination: `LIMIT` + `OFFSET`
- Frontend pagination: `Previous` / `Next` controls

## 🐳 Docker Volumes

The project uses named volumes for persistence:

- `db_data` — PostgreSQL data
- `images` — uploaded image files
- `logs` — application logs
- `backups` — backup storage

## 📝 Logging

Application logs are written to:

```text
/logs/app.log
```

Since `/logs` is mounted as a Docker volume, logs persist across container restarts.

## 💾 Backup and Restore

The project includes a backup script located at:

```text
scripts/backup.py
```

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

### Notes

- The script uses `docker exec` to run `pg_dump` and `psql` inside the PostgreSQL container.
- Make sure `DB_CONTAINER_NAME` matches your actual database container name.
- Backup files are stored in the directory defined by `BACKUP_DIR`.

## 🧰 Useful Docker Commands

### Show running services

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f
```

### Stop the application

```bash
docker compose down
```

### Stop the application and remove volumes

```bash
docker compose down -v
```

## 🔮 Possible Improvements

A few ideas for future development:
- Replace manual multipart parsing with a more robust request parser
- Add image content validation using Pillow
- Improve error handling and structured logging
- Add tests for upload, gallery, delete, and backup flows
- Add drag-and-drop progress indicator and user notifications

## 📚 What I Practiced

Through this project, I practiced and improved my skills in:

- building a small full-stack web application
- handling file uploads safely
- validating user input on both the client and server sides
- integrating Python with PostgreSQL
- working with Docker Compose in a multi-service setup
- configuring Nginx for reverse proxying and static file serving
- implementing a paginated image gallery
- writing backup and restore scripts for PostgreSQL

This project was created as a practical portfolio piece to combine backend logic, database integration, frontend interaction, and Docker-based deployment in one application.

---

## 👨‍💻 Author
 
📌 Full-Stack Python Developer
🔗 LinkedIn: (https://www.linkedin.com/in/stanislav-novhorodskiy-482924388/)