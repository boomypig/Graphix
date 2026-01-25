//MOVED TO RESPECTive FRAGMENT AND VERTEX TXT FILES
// const vertexShader = `
//     precision mediump float;

//     attribute vec2 vertPosition;
//     uniform mat4 uProjectionMatrix;
//     void main(){
//         gl_Position = uProjectionMatrix * vec4(vertPosition, 0.0, 1.0);
//     }
// `;
// const fragmentShader = `
//     precision mediump float;

//     uniform vec4 uColor;

//     void main(){
//         gl_FragColor = uColor;
//     }
// `;

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

  //   //create function to find circle vertices positions
  // MOVED TO CIRCLE.js
  //   function createCircleVerticies(sides) {
  //     const vertices = [];
  //     vertices.push(0);
  //     vertices.push(0);
  //     for (let i = 0; i < sides + 1; i++) {
  //       const radians = (i / sides) * 2 * Math.PI;
  //       const x = Math.cos(radians);
  //       const y = Math.sin(radians);
  //       vertices.push(x);
  //       vertices.push(y);
  //     }
  //     return vertices;
  //   }

  //   const sides = 64;
  //   const circlVertices = createCircleVerticies(sides);
  //   //create buffer for verticesu
  //   const circleBufferObject = gl.createBuffer();

  //   gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferObject);
  //   gl.bufferData(
  //     gl.ARRAY_BUFFER,
  //     new Float32Array(circlVertices),
  //     gl.STATIC_DRAW,
  //   );

  //   //vertex attributes

  //   const positionAttributes = gl.getAttribLocation(
  //     shaderProgram,
  //     "vertPosition",
  //   );
  //   gl.vertexAttribPointer(
  //     positionAttributes,
  //     2,
  //     gl.FLOAT,
  //     gl.FALSE,
  //     2 * Float32Array.BYTES_PER_ELEMENT,
  //     0,
  //   );
  //   gl.enableVertexAttribArray(positionAttributes);
  //   const uniformColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  //   const circColor = [1, 0, 1, 1];
  //   gl.uniform4fv(uniformColorLocation, circColor);

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
  console.log("should run main")
}
subButtton.addEventListener("click", changCircleAmount)

// //THIS HAS BEEN MOVED TO SHADER.JS
// function initShaderProgram(gl, vsSource, fsSource) {
//   //get the source of the shaders and send them to get compiled
//   const vertexShader = loadshader(gl, gl.VERTEX_SHADER, vsSource);
//   const fragmentShader = loadshader(gl, gl.FRAGMENT_SHADER, fsSource);

//   //create the actual program
//   const shaderProgram = gl.createProgram();
//   gl.attachShader(shaderProgram, vertexShader);
//   gl.attachShader(shaderProgram, fragmentShader);
//   gl.linkProgram(shaderProgram);

//   //test if the two shader attached
//   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//     alert(
//       `unable to initialize shader program ${gl.getShaderInfoLog(shaderProgram)}`,
//     );
//     return null;
//   }

//   //test if program works
//   gl.validateProgram(shaderProgram);
//   if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
//     console.error("ERROR validating program", gl.getProgramInfoLog(shaderProgram));
//     return;
//   }
//   gl.useProgram(shaderProgram);

//   return shaderProgram;
// }

// function loadshader(gl, type, source) {
//   //create specific shader
//   const shader = gl.createShader(type);

//   //connect the shader type to the source code
//   gl.shaderSource(shader, source);

//   //compile shader
//   gl.compileShader(shader);

//   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//     alert(
//       `an error happened when compiling shader ${gl.getShaderInfoLog(shader)}`,
//     );
//     gl.deleteShader(shader);
//     return null;
//   }
//   return shader;
// }
