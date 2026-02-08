import { Circle } from "./circles.js";
import { initShaderProgram } from "./shader.js";
async function main() {
  console.log("connection good");
  //get the canvas from the html
  const canvas = document.getElementById("webcanvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  //connect to webgl library
  const gl = canvas.getContext("webgl");
  //check that it is good
  if (!gl) {
    alert("your browser doesn't support html5");
  }


  console.log('This is working');
//////////////////////////////////// Beginning of accelerometer initialization code
//This code should work for Windows and MAC.
  let gravity = [0, -1]; // Always between -1 and +1 in both directions. Scaled later.
  let hardwareWorking = false;
  if (!(window.DeviceOrientationEvent == undefined)) {
    window.addEventListener("deviceorientation", handleOrientation);
    }
  function handleOrientation(event) {
    let x = event.beta; // In degree in the range [-180,180)
    let y = event.gamma; // In degree in the range [-90,90)
    if (x == null || y == null) {
      gravity[0] = 0;
      gravity[1] = -1;
    }else {
      hardwareWorking = true;
      // Because we don't want to have the device upside down
      // We constrain the x value to the range [-90,90]
      if (x > 90) {
        x = 90;
      }
      if (x < -90) {
        x = -90;
      }
      gravity[0] = y / 90; // -1 to +1
      gravity[1] = -x / 90; // flip y upside down.
    }
  }
  // For MAC, add a permission button here:
  if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
    const button = document.createElement("button");
    button.innerText = "Enable Device Orientation";
    document.body.appendChild(button);
    button.addEventListener("click", function () {
    DeviceOrientationEvent.requestPermission().then((permissionState) => {
      if (permissionState === "granted") {
        button.style.display = "none";
      }else {
      alert("Device orientation permission not granted");
      }
    }).catch(console.error);
    });
  } // if DeviceOrientation
    else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
//////////////////////////////////// End of accelerometer initialization code

  //clear the color and its buffer bit
  gl.clearColor(0.3, 0.2, 0.2, 1.0);
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
  let i = 0;
  let failures = 0;
  const numCircles = 6

  while (i < numCircles && failures < 1000) {
    const c = new Circle(xhigh, xlow, yhigh, ylow);
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
  function redraw(currentTime) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    currentTime *= 0.001;
    let DT = currentTime - previousTime;
    previousTime = currentTime;
    if (DT > 0.05) DT = 0.05;

    const repeatCollisions = 3;
    for (let i = 0; i < repeatCollisions; i++) {
      for (let j = 0; j < circleArray.length; j++) {
        circleArray[j].updateCollisions(DT, circleArray, j);
      }
    }
    for (let i = 0; i < circleArray.length; i++) {
      circleArray[i].update(DT,gravity);
    }
    for (let i = 0; i < circleArray.length; i++) {
      circleArray[i].draw(gl, shaderProgram);
    }

    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
}
// const numCircles = document.getElementById("circNumber");
// const subButtton = document.getElementById("submitButton");

// function changCircleAmount() {
//   const n = numCircles.valueAsNumber;
//   if (!Number.isFinite(n)) {
//     return;
//   }
//   main(n);
// }
// function canvasValue() {
//   console.log(canvas.value);
// }
// subButtton.addEventListener("click", changCircleAmount);
// const canvas = document.getElementById("webcanvas");
// canvas.addEventListener("click", canvasValue);
main()