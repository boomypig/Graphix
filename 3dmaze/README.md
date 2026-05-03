# 3D Maze

A browser-based 3D maze explorer built with vanilla WebGL and gl-matrix. Generates a random maze and lets you navigate it from multiple camera perspectives.

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
