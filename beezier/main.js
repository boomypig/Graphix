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

  const vertexShader = await (await fetch("simple.vs")).text();
  const fragmentShader = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(shaderProgram);
  const { mat4 } = glMatrix;

  // === World boundaries (same idea as your circles project) ===
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const yhigh = 10;
  const ylow = -yhigh;
  const xlow = ylow * aspect;
  const xhigh = yhigh * aspect;

  // Upload BOTH matrices
  const uProj = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  const uMV = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");

  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(uProj, false, projectionMatrix);

  const modelViewMatrix = mat4.create(); // identity
  gl.uniformMatrix4fv(uMV, false, modelViewMatrix);

  // Attribute + color uniform
  const aPos = gl.getAttribLocation(shaderProgram, "vertPosition");
  const uColor = gl.getUniformLocation(shaderProgram, "uColor");

  // === Curves storage ===
  const curves = [];

  function randColor() {
    // slightly bright colors so they show on your background
    const r = 0.3 + 0.7 * Math.random();
    const g = 0.3 + 0.7 * Math.random();
    const b = 0.3 + 0.7 * Math.random();
    return [r, g, b, 1.0];
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function makeNiceCurvePlacement(index) {
    // place new curves in a “staggered” pattern so they don’t overlap
    const spanX = xhigh - xlow;
    const spanY = yhigh - ylow;

    const offsetX = (index % 3) * (spanX * 0.12) - spanX * 0.12;
    const offsetY = Math.floor(index / 3) * (spanY * 0.12) - spanY * 0.12;

    const cx = (xlow + xhigh) * 0.5 + offsetX;
    const cy = (ylow + yhigh) * 0.5 + offsetY;

    const dx = spanX * 0.12;
    const dy = spanY * 0.12;

    return new Bezier(
      new Point2(cx - 2 * dx, cy - 0.5 * dy),
      new Point2(cx - 1 * dx, cy + 1.5 * dy),
      new Point2(cx + 1 * dx, cy - 1.5 * dy),
      new Point2(cx + 2 * dx, cy + 0.5 * dy),
      randColor(), // <-- store curve color
      // pick radius in WORLD units (bigger = easier to click)
      // good default: ~2% of the smaller world dimension
      Math.min(spanX, spanY) * 0.02,
    );
  }

  // Start with 1 curve
  curves.push(makeNiceCurvePlacement(0));

  // Button: add more curves
  const addBtn = document.getElementById("addCurveBtn");
  addBtn.addEventListener("click", () => {
    curves.push(makeNiceCurvePlacement(curves.length));
  });

  // === Picking state (Step 3 requirement) ===
  let mouseDown = false;
  let pickedCurveIndex = -1;
  let pickedPointIndex = -1;

  function mouseToWorld(e) {
    const r = canvas.getBoundingClientRect();
    const xPix = e.clientX - r.left;
    const yPix = e.clientY - r.top;

    const xWorld = xlow + (xPix / r.width) * (xhigh - xlow);
    const yWorld = ylow + ((r.height - yPix) / r.height) * (yhigh - ylow);
    return { x: xWorld, y: yWorld };
  }

  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    const { x, y } = mouseToWorld(e);

    // Find the first curve/point hit (top-most = last curve feels nicer)
    pickedCurveIndex = -1;
    pickedPointIndex = -1;

    for (let ci = curves.length - 1; ci >= 0; ci--) {
      const pi = curves[ci].isPicked(x, y);
      if (pi !== -1) {
        pickedCurveIndex = ci;
        pickedPointIndex = pi;
        break;
      }
    }
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    pickedCurveIndex = -1;
    pickedPointIndex = -1;
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    if (pickedCurveIndex === -1 || pickedPointIndex === -1) return;

    const { x, y } = mouseToWorld(e);

    // Clamp inside world bounds so points don’t “disappear”
    const cx = clamp(x, xlow, xhigh);
    const cy = clamp(y, ylow, yhigh);

    curves[pickedCurveIndex].setPoint(pickedPointIndex, cx, cy);
  });

  function redraw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Optional: draw world bounds so you can “see” the boundary box
    gl.uniform4fv(uColor, new Float32Array([0.9, 0.9, 0.9, 1.0]));
    drawBounds(gl, aPos, xlow, xhigh, ylow, yhigh);

    for (let ci = 0; ci < curves.length; ci++) {
      const c = curves[ci];

      // Control polygon (light gray)
      gl.uniform4fv(uColor, new Float32Array([0.8, 0.8, 0.8, 1.0]));
      c.drawControlPolygon(gl, aPos);

      // Curve (random per curve)
      gl.uniform4fv(uColor, new Float32Array(c.color));
      c.drawCurve(gl, aPos);

      // Control points (white)
      gl.uniform4fv(uColor, new Float32Array([1, 1, 1, 1]));
      c.drawControlPoints(gl, aPos);

      // Highlight picked control point (yellow)
      if (ci === pickedCurveIndex && pickedPointIndex !== -1) {
        gl.uniform4fv(uColor, new Float32Array([1, 1, 0, 1]));
        c.drawSingleControlPoint(gl, aPos, pickedPointIndex);
      }
    }

    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
}

// ===== helpers =====
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
