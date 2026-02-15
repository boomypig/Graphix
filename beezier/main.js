// main.js (Bezier Curves + drag control points + world-space boundaries)
import { Point2 } from "./point2.js";
import { Bezier } from "./bezier.js";
import { initShaderProgram } from "./shader.js";

main();

async function main() {
  const canvas = document.getElementById("webcanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL not supported");
    return;
  }

  // Compile/link shaders
  const vertexShader = await (await fetch("simple.vs")).text();
  const fragmentShader = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(shaderProgram);

  // === World boundaries (like your circles program) ===
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const yhigh = 10;
  const ylow = -yhigh;
  const xlow = ylow * aspect;
  const xhigh = yhigh * aspect;

  // Upload BOTH matrices (your shader multiplies by both)
  const uProj = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  const uMV = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");

  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(uProj, false, projectionMatrix);

  const modelViewMatrix = mat4.create(); // identity
  gl.uniformMatrix4fv(uMV, false, modelViewMatrix);

  // Attribute location
  const aPos = gl.getAttribLocation(shaderProgram, "vertPosition");

  // One default Bezier curve (in WORLD coordinates now)
  const curve = new Bezier(
    new Point2(xlow * 0.6, ylow * 0.2),
    new Point2(xlow * 0.2, yhigh * 0.7),
    new Point2(xhigh * 0.2, ylow * 0.7),
    new Point2(xhigh * 0.6, yhigh * 0.2),
  );

  // === Mouse interaction ===
  let mouseDown = false;
  let pickedIndex = -1;

  function mouseToWorld(e) {
    const r = canvas.getBoundingClientRect();
    const xPix = e.clientX - r.left;
    const yPix = e.clientY - r.top;

    // Map pixels -> world bounds
    const xWorld = xlow + (xPix / r.width) * (xhigh - xlow);
    const yWorld = ylow + ((r.height - yPix) / r.height) * (yhigh - ylow);
    return { x: xWorld, y: yWorld };
  }

  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    const { x, y } = mouseToWorld(e);
    pickedIndex = curve.isPicked(x, y);
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    pickedIndex = -1;
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown || pickedIndex === -1) return;
    const { x, y } = mouseToWorld(e);
    curve.setPoint(pickedIndex, x, y);
  });

  // === Draw loop ===
  function redraw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Optional: draw a boundary box (LINE_STRIP) so you "see" the world bounds
    drawBounds(gl, aPos, xlow, xhigh, ylow, yhigh);

    // Draw Bezier curve + control points
    curve.drawCurve(gl, aPos);
    curve.drawControlPoints(gl, aPos);

    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
}

// Helper: draw the world boundary rectangle
function drawBounds(gl, aPos, xlow, xhigh, ylow, yhigh) {
  const verts = new Float32Array([
    xlow,
    ylow,
    xhigh,
    ylow,
    xhigh,
    yhigh,
    xlow,
    yhigh,
    xlow,
    ylow,
  ]);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);

  gl.drawArrays(gl.LINE_STRIP, 0, 5);

  gl.deleteBuffer(buf);
}
