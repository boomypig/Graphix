# 3D Maze

A browser-based 3D maze explorer built with vanilla WebGL and gl-matrix. Generates a random maze and lets you navigate it from multiple camera perspectives.
# Rat Views: 
observation : 
<img width="837" height="681" alt="Screenshot 2026-05-03 143802" src="https://github.com/user-attachments/assets/786912a5-17c2-4558-9ff9-785abf88e412" />
1st Person:
<img width="1442" height="844" alt="Screenshot 2026-05-03 143816" src="https://github.com/user-attachments/assets/e1e42051-f534-44b0-aaff-ce3c20bcc276" />
Top View: 
<img width="811" height="850" alt="Screenshot 2026-05-03 143739" src="https://github.com/user-attachments/assets/5668986d-9722-4236-a257-a2ad933464ee" />


## How to Run

Serve this folder with any static HTTP server and open `index.html` in a browser.

```
npx serve .
```

## Controls

| Key | Action |
|-----|--------|
| W / S | Move forward / backward |
| A / D | Strafe left / right |
| Q / E | Turn left / right |
| T | Top-down view |
| R | First-person rat view |
| O | Observer (free camera) view |
| Arrow keys | Move/rotate observer camera |

## Project Structure

- `main.js` — Entry point, render loop, input handling, view setup
- `maze.js` — Maze generation and cell rendering
- `rat.js` — Player entity (position, movement, collision)
- `camera.js` — Observer camera controls
- `drawscene.js` — Scene drawing utilities
- `buffers.js` — WebGL buffer initialization
- `shader.js` — Shader compilation helpers
- `shapes2d.js` — 2D shape primitives
- `simple.vs` / `simple.fs` — Vertex and fragment shaders
