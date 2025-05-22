How to Play Locally:
Due to browser security policies (CORS) regarding JavaScript ES modules
loaded from the file system (file:///), you need to serve these files
using a local HTTP server.

1. Download `index.html` and `app.js` into the same directory.
2. Open your terminal or command prompt and navigate to that directory.
3. Start a local HTTP server. Examples:
    - If you have Python 3: `python -m http.server`
      (or `python3 -m http.server` on some systems)
    - If you have Node.js and npm:
        - Install `serve` globally (if you haven't already): `npm install -g serve`
        - Run: `serve .`
4. Open your web browser and navigate to the address shown by the server,
   usually `http://localhost:8000` or `http://127.0.0.1:8000`.
