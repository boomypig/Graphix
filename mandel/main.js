import { initShaderProgram } from "./shader.js";
import {
  drawCircle,
  drawRectangle,
  drawTriangle,
  drawLineStrip,
} from "./shapes2d.js";
import { randomDouble } from "./random.js";

main();
async function main() {
  console.log("This is working");

  //
  // start gl
  //
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Your browser does not support WebGL");
  }
  gl.clearColor(0.25, 0.85, 0.4, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //
  // Create shaders
  //
  const vertexShaderText = await (await fetch("mandel.vs")).text();
  const fragmentShaderText = await (
    await fetch("mandel.fs", { cache: "no-store" })
  ).text();
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText,
  );

  //
  // load a projection matrix onto the shader
  //
  gl.useProgram(shaderProgram);

  // Set model-view to identity (unless you actually want transforms)
  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix",
  );
  const modelViewMatrix = mat4.create(); // identity
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix",
  );
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  let xlow = -2.5; // could go -2.0 to .47
  let xhigh = 0.5;
  let ylow = -1.5; // could go -1.12 to 1.12
  let yhigh = 1.5;
  if (aspect >= 1) {
    xlow *= aspect;
    xhigh *= aspect;
  } else {
    ylow /= aspect;
    yhigh /= aspect;
  }
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  //
  // Create content to display
  //

  //
  // Register Listeners
  //

  // Handle the wheel event
  addEventListener("wheel", function (event) {
    // Pixel coordinates to world coordinates:
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.y) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    const xWorld = xlow + (event.x / gl.canvas.clientWidth) * (xhigh - xlow);

    // Reset world boundaries based on where the mouse is.
    let scale = 0.9;
    if (event.deltaY < 0) scale = 1.0 / scale;
    xlow = xWorld - (xWorld - xlow) * scale;
    xhigh = xWorld + (xhigh - xWorld) * scale;
    ylow = yWorld - (yWorld - ylow) * scale;
    yhigh = yWorld + (yhigh - yWorld) * scale;

    // Move the new world boundaries to the graphics card.
    mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
    gl.uniformMatrix4fv(
      projectionMatrixUniformLocation,
      false,
      projectionMatrix,
    );
  });

  let mouseDown = false;
  let xMouse = 0;
  let yMouse = 0;

  addEventListener("mousedown", mousedown);
  function mousedown(event) {
    mouseDown = true;
    xMouse = event.offsetX;
    yMouse = event.offsetY;
  }

  addEventListener("mousemove", mousemove);
  function mousemove(event) {
    if (mouseDown) {
      let dx = event.offsetX - xMouse;
      let dy = event.offsetY - yMouse;
      dx *= (xhigh - xlow) / gl.canvas.clientWidth;
      dy *= (yhigh - ylow) / gl.canvas.clientHeight;

      xlow -= dx;
      xhigh -= dx;
      ylow += dy;
      yhigh += dy;
      xMouse = event.offsetX;
      yMouse = event.offsetY;

      mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
      gl.uniformMatrix4fv(
        projectionMatrixUniformLocation,
        false,
        projectionMatrix,
      );
    }
  }
  addEventListener("mouseup", mouseup);
  function mouseup(event) {
    mouseDown = false;
  }

  //
  // Main render loop
  //
  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DT = currentTime - previousTime;
    if (DT > 0.1) DT = 0.1;
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawRectangle(gl, shaderProgram, xlow, ylow, xhigh, yhigh, [0.9, 0, 0, 1]);

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}
