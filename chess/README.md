# 3D Chess Set — WebGL

A real-time 3D chess set rendered entirely with raw WebGL. No frameworks, no Three.js just shaders, matrix math, and a render loop.

The scene features textured marble pieces and a wooden board, Phong shading with specular highlights, and an animated chess opening (Scandinavian Defense) that plays on loop with arc-based piece movement, front-flip animations, and an exploding capture effect.
<img width="1130" height="706" alt="image" src="https://github.com/user-attachments/assets/a71b7ad1-4cc5-4daf-b9d1-4bde163a1574" />


## Features

- **Raw WebGL rendering** — vertex buffers, shader programs, and draw calls written from scratch
- **Custom GLSL shaders** — vertex and fragment shaders implementing full Phong illumination (ambient + diffuse + specular)
- **OBJ model loader** — parses Blender-exported `.obj` files at runtime, building GPU buffers with interleaved position/UV/normal data
- **Animated chess opening** — scripted move sequence with smooth interpolation, parabolic arcs, and per-piece timing
- **Capture explosion** — captured pieces shatter into spinning fragments that fly outward and fade
- **Piece flip animations** — knights do a full 360° front flip mid-air during movement

## Tech Stack

| Layer | Tool |
|-------|------|
| Graphics API | WebGL 1.0 |
| Shading | GLSL ES (custom vertex + fragment shaders) |
| Math | gl-matrix |
| 3D Models | Wavefront OBJ (Blender) |
| Textures | Hand-painted diffuse maps (marble, wood) |
| Build | None — vanilla ES modules, no bundler |

## Run It

Serve the project directory with any static file server and open `index.html`:

```bash
# Python
python3 -m http.server

# Node
npx serve .
```

Then open `http://localhost:8000` (or whichever port) in your browser.

## Project Structure

```
├── index.html                      # Entry point
├── main.js                         # WebGL init, camera, render loop
├── chessSet.js                     # Board + piece logic, OBJ parser, animations
├── shader.js                       # Shader compilation and linking
├── helpers.js                      # Texture loading, vertex attribute setup
├── textureNormalTriangles.vs       # Vertex shader (GLSL)
├── textureNormalTriangles.fs       # Fragment shader (GLSL)
└── pieces/                         # 3D models (.obj) and texture maps (.png)
```
