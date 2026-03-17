import { Circle } from "./circles.js";
import { initShaderProgram } from "./shader.js";
async function main(numCircles) {
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
  gl.clearColor(0.3, 0.4, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //init the shader program
  //go make initshaderProgram
  let vertexShader = await (await fetch("simple.vs")).text();
  let fragmentShader = await (await fetch("simple.fs")).text();
  let shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);

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
  for (let i = 0; i < numCircles; i++) {
    const c = new Circle(xhigh, xlow, yhigh, ylow);
    circleArray.push(c);
  }

  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001;
    let DT = currentTime - previousTime;
    previousTime = currentTime;
    if (DT < 0.1) {
      DT = 0.1;
    }

    for (let i = 0; i < numCircles; i++) {
      circleArray[i].update(DT);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let i = 0; i < numCircles; i++) {
      circleArray[i].draw(gl, shaderProgram);
    }

    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
}
const numCircles = document.getElementById("circNumber")
const subButtton = document.getElementById("submitButton")

function changCircleAmount(){
  main(numCircles.value)
}
subButtton.addEventListener("click", changCircleAmount)