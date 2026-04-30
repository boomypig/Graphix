# Graphix

A collection of WebGL graphics demos and experiments, each in its own directory.

## Demos

| Project | Description |
|---------|-------------|
| **simTriangle** | Hello-world WebGL -- renders a colored triangle with inline shaders |
| **2dmaze** | 2D maze generator and renderer |
| **3dmaze** | First-person 3D maze with textured walls, camera movement, and maze generation |
| **chess** | 3D chess set loaded from OBJ models with multiple material/texture options |
| **mandel** | Mandelbrot set fractal rendered via fragment shader |
| **beezier** | Interactive cubic Bezier curve editor with draggable control points |
| **terrain3d** | Procedurally generated 3D terrain with water, using randomized sine waves |
| **fallinbalss** | Falling / bouncing circles with collision detection |
| **balls2** | Ball collision simulation (variant) |
| **iosballs** | Bouncing balls packaged as an installable PWA (service worker + manifest) |
| **reinvent** | Scratch-pad rewrites -- red-vs-blue ball sim and a Bezier curve copy |

## Tech

All demos run in the browser with vanilla JavaScript and the WebGL API. Shaders are written in GLSL (`.vs` / `.fs` files). No build step -- open any `index.html` in a local server to run.
