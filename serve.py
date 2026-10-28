"""Run the website on this computer. No upload or public hosting."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
server = None
for port in range(5184, 5200):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
        break
    except OSError:
        continue
if server is None:
    raise SystemExit('No free local preview port. Close an older preview and try again.')
url = f'http://127.0.0.1:{server.server_port}'
print(f'\nAuto Tiller is ready: {url}\nKeep this window open while viewing the website.\nPress Control-C to stop.\n', flush=True)
Timer(0.5, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\nPreview stopped.')
finally:
    server.server_close()
