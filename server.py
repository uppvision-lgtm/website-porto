#!/usr/bin/env python3
"""
Server lokal buat portfolio mood.
Pakai:  python3 server.py [port]     (default port 8000)
Buka:   http://localhost:8000/
Support HTTP Range -> video di Safari bisa play & seek.
"""
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class _RangeFile:
    """Wrapper file yang cuma meluluis `left` byte dari posisi seek."""

    def __init__(self, f, left):
        self.f = f
        self.left = left

    def read(self, n=-1):
        if self.left <= 0:
            return b""
        n = self.left if n < 0 else min(n, self.left)
        data = self.f.read(n)
        self.left -= len(data)
        return data

    def close(self):
        self.f.close()


class RangeHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".svg": "image/svg+xml",
    }

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path) or not self.headers.get("Range"):
            # Tanpa Range: serahkan ke handler bawaan Python supaya dapat
            # header Last-Modified + dukungan If-Modified-Since -> 304 Not Modified.
            # Ini kunci utama: aset (css/js/img) tidak di-download ulang
            # setiap pindah halaman, browser cukup revalidasi (304, cepat).
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None
        try:
            size = os.fstat(f.fileno()).st_size
            match = re.match(r"bytes=(\d*)-(\d*)$", self.headers.get("Range") or "")
            if not match:
                f.close()
                return super().send_head()
            start = int(match.group(1)) if match.group(1) else 0
            end = int(match.group(2)) if match.group(2) else size - 1
            end = min(end, size - 1)
            if start > end or start >= size:
                f.close()
                self.send_error(416, "Requested Range Not Satisfiable")
                return None
            self.send_response(206)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
            self.send_header("Content-Length", str(end - start + 1))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Last-Modified", self.date_time_string(os.fstat(f.fileno()).st_mtime))
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            f.seek(start)
            return _RangeFile(f, end - start + 1)
        except Exception:
            f.close()
            raise

    def log_message(self, fmt, *args):
        sys.stderr.write("[mood-server] %s - %s\n" % (self.address_string(), fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), RangeHandler)
    print("Portfolio mood jalan di http://localhost:%d/  (Ctrl+C buat stop)" % port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
