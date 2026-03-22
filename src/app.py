import http.server
import io
import socketserver
import os
import json
import re

from validators import validate_image_file
from file_handler import save_file, delete_file
from database import DatabaseManager

db = DatabaseManager()


class ImageServerHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        routes = {
            '/': 'index.html',
            '/upload': 'upload.html',
            '/images-list': 'images.html',
        }

        if self.path in routes:
            self.serve_template(routes[self.path])
        elif self.path.startswith('/static/'):
            self.serve_static(self.path)
        elif self.path.startswith('/images/'):
            self.serve_uploaded_image(self.path)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/upload':
            self.handle_upload()
        elif self.path == '/delete':
            self.handle_delete()
        else:
            print(f'404 - Path not found: {self.path}')
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        if self.path.startswith('api/images/'):
            self.handle_delete()
        else:
            self.send_response(404)
            self.end_headers()

    def handle_upload(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'Expected multipart/form-data'
                }).encode('utf-8'))
                return

            content_length = int(self.headers.get('Content-Length', 0))
            form_data = self.rfile.read(content_length)

            filename = self._extract_filename(form_data)
            file_bytes = self._extract_file_bytes(form_data)

            if not filename or not file_bytes:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'Could not parse uploaded file'
                }).encode('utf-8'))
                return

            file_like = io.BytesIO(file_bytes)
            is_valid, message = validate_image_file(file_like, filename)

            if not is_valid:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': message,
                }).encode('utf-8'))
                return

            saved_name = save_file(file_bytes, filename)

            ext = filename.lower().split('.')[-1]
            db.save_metadata(
                filename = saved_name,
                original_name=filename,
                size=len(file_bytes),
                file_type = ext
            )

            if not saved_to_db:
                delete_file(saved_name)
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'File saved, but database insert failed'
                }).encode('utf-8'))
                return

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'message': 'File uploaded successfully',
                'filename': saved_name,
                'url': f'/images/{saved_name}'
            }).encode('utf-8'))

        except Exception as e:
            print(f"Error in upload: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode('utf-8'))

    def handle_get_images(self):
        try:
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            page = int(params.get('page', [1])[0])

            images, total = db.get_all_images(page=page)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'images': [dict(img) for img in images],
                'total': total,
                'page': page
            }, default=str).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))

    def handle_delete_image(self):
        try:
            image_id = int(self.path.split('/')[-1])
            filename = db.delete_image(image_id)

            if filename:
                delete_file(filename)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': f'Image {filename} deleted successfully',
                }).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'Image not found',
                }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))

    def handle_delete(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            filename = data.get('filename')
            print(f"Attempting to delete: {filename}")

            if not filename:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'Filename is required',
                }).encode('utf-8'))
                return

            deleted = delete_file(filename)
            print(f"Delete result: {deleted}")

            if deleted:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': 'File deleted successfully',
                }).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': 'File not found'
                }).encode('utf-8'))

        except Exception as e:
            print(f"Erro in delete: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))

    def _extract_filename(self, form_data):
        try:
            decoded = form_data.decode('utf-8', errors='ignore')
            match = re.search(r'filename="([^"]+)"', decoded)
            if match:
                return match.group(1)
        except Exception as e:
            pass
        return "unknown"


    def _extract_file_bytes(self, form_data):
        boundary = form_data.split(b'\r\n')[0]
        parts = form_data.split(boundary)

        for part in parts:
            if b'Content-Type' in part or b'filename=' in part:
                header_end = part.find(b'\r\n\r\n')
                if header_end != -1:
                    file_content = part[header_end + 4:]
                    if file_content.endswith(b'\r\n'):
                        file_content = file_content[:-2]
                    return file_content
        return b''


    def serve_template(self, filename):
        try:
            template_path = os.path.join(os.path.dirname(__file__), 'templates', filename)
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def serve_static(self, path):
        try:
            file_path = path[len('/static/'):]
            static_path = os.path.join(os.path.dirname(__file__), 'static', file_path)
            with open(static_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            content_type = self.get_content_type(file_path)
            self.send_header('Content-type', content_type)
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def serve_uploaded_image(self, path):
        try:
            filename = path[len('/images/'):]
            image_path = os.path.join(os.path.dirname(__file__), '..', 'images', filename)
            image_path = os.path.abspath(image_path)

            with open(image_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-type', self.get_content_type(filename))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def get_content_type(self, file_path):
        if file_path.endswith('.css'):
            return 'text/css'
        elif file_path.endswith('.js'):
            return 'application/javascript'
        elif file_path.endswith('.png'):
            return 'image/png'
        elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
            return 'image/jpeg'
        else:
            return 'application/octet-stream'

def run_server(port=8000):
    port = int(os.environ.get("PORT", port))
    db.connect()
    try:
        with socketserver.TCPServer(("", port), ImageServerHandler) as httpd:
            print(f"Server running on port {port}...")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("Server stopped by user...")
    except OSError as e:
        if e.errno == 48:
            print(f"Port {port} is already in use. Please stop the server | lsof -ti :8000 | xargs kill -9")
        else:
            print(f"Error starting server: {e}")
    finally:
        db.disconnect()

if __name__ == '__main__':
    run_server()
