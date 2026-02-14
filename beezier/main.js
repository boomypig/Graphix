import { Circle } from "./circles.js";
import { collideParticles } from "./collisions.js";
import { Point2 } from "./piont2.js";
import { initShaderProgram } from "./shader.js";
main();
async function main() {
  console.log("connection good");
  //get the canvas from the html
  const canvas = document.getElementById("webcanvas");
  //connect to webgl library
  const gl = canvas.getContext("webgl");
  //check that it is good
  if (!gl) {
    alert("your browser doesn't support html5");
  }
  //clear the color and its buffer bit
  gl.clearColor(0.3, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //init the shader program
  //go make initshaderProgram
  const vertexShader = await (await fetch("simple.vs")).text();
  const fragmentShader = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(shaderProgram);

  const ProjectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix",
  );

  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  const yhigh = 10;
  const ylow = -yhigh;
  const xlow = ylow * aspect;
  const xhigh = yhigh * aspect;
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(ProjectionMatrixUniformLocation, false, projectionMatrix);

  const circleArray = [];
  let i = 0;
  let failures = 0;
  addEventListener("click", makeCircle);

  function makeCircle(event) {
    console.log("click");
    const xWorld =
      xlow + (event.offsetX / gl.canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    console.log(xWorld, yWorld);

    const c = new Circle(xhigh, xlow, yhigh, ylow, xWorld, yWorld);
    let intersect = false;
    for (let j = 0; j < circleArray.length; j++) {
      const distance =
        (c.x - circleArray[j].x) ** 2 + (c.y - circleArray[j].y) ** 2;
      if (distance < (c.radius + circleArray[j].radius) ** 2) {
        intersect = true;
      }
    }
    if (!intersect) {
      circleArray.push(c);
      i += 1;
    } else {
      failures += 1;
    }
  }

  let previousTime = 0;
  let stripsArray = [];
  let j = 0;
  let numStrips = 1;
  while (j < numStrips) {
    const s = new Point2(0, 0, 2, 0);
    stripsArray.push(s);
    j += 1;
  }

  function redraw(currentTime) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    currentTime *= 0.001;
    let DT = currentTime - previousTime;
    previousTime = currentTime;
    if (DT > 0.05) DT = 0.05;

    // const repeatCollisions = 3;
    // for (let i = 0; i < repeatCollisions; i++) {
    //   for (let j = 0; j < circleArray.length; j++) {
    //     circleArray[j].updateCollisions(DT, circleArray, j);
    //   }
    // }
    // for (let i = 0; i < circleArray.length; i++) {
    //   circleArray[i].update(DT);
    // }
    // for (let i = 0; i < circleArray.length; i++) {
    //   circleArray[i].draw(gl, shaderProgram);
    // }
    for (let i = 0; i < numStrips.length; i++) {
      stripsArray[i].drawStrip(gl, shaderProgram);
    }
    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
}
