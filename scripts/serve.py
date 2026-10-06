#!/usr/bin/env python3
"""
iCam / SnapStudio Local Development & Mobile Testing Server
Serves the Web MVP prototype bound to 0.0.0.0 with proper MIME types
and CORS headers for seamless iPhone 15 Pro Max and desktop testing.
"""

import sys
import os
import socket
import http.server
import socketserver

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

class DevServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.html'):
            return 'text/html; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        if path.endswith('.png'):
            return 'image/png'
        if path.endswith('.jpg') or path.endswith('.jpeg'):
            return 'image/jpeg'
        return super().guess_type(path)


def get_lan_ips():
    lan_ips = []
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith('127.') and not ip.startswith('172.29.'):
                lan_ips.append(ip)
        if not lan_ips:
            lan_ips = socket.gethostbyname_ex(hostname)[2]
    except Exception:
        pass
    return lan_ips


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), DevServerHandler) as httpd:
        lan_ips = get_lan_ips()
        print("=" * 70)
        print("🚀 iCam / SnapStudio 로컬 테스트 서버가 실행되었습니다!")
        print("=" * 70)
        print(f"📁 Serving Directory: {DIRECTORY}")
        print(f"💻 [PC 브라우저 접속 주소]: http://localhost:{PORT}")
        for ip in lan_ips:
            print(f"📱 [아이폰 15 프로맥스 접속 주소]: http://{ip}:{PORT}")
        print("-" * 70)
        print("💡 [iPhone 15 Pro Max 사용 팁]:")
        print("   1. 아이폰 Safari에서 위 주소로 접속하세요.")
        print("   2. Safari 하단 공유 버튼 > [홈 화면에 추가]를 누르면")
        print("      주소창 없는 풀스크린 네이티브 앱(PWA)으로 실행됩니다.")
        print("=" * 70)
        print("서버가 요청을 수신 대기 중입니다... (종료: Ctrl+C)\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 서버가 종료되었습니다.")

if __name__ == '__main__':
    main()
