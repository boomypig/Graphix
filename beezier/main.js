import { initShaderProgram } from "./shader.js";

main();
async function main() {
  console.log("conncected");
  const canvas = document.getElementById("webcanvas");
  const gl = canvas.getcontext("webgl");
  if (!gl) {
    alert("your browser doesn't support html5");
  }
  gl.clearColor(0.5, 0.2, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShaderText = await (await fetch("simple.vs")).text();
  const fragmentShaderText = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText,
  );

  //
  // load a projection matrix onto the shader
  //
  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix",
  );
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  let yhigh = 10;
  let ylow = -yhigh;
  let xlow = ylow;
  let xhigh = yhigh;
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
  // load a modelview matrix onto the shader
  //
  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix",
  );
  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
}
