import { initShaderProgram } from "./shader.js";
import { Maze } from "./maze.js";
import { Rat } from "./rat.js";
import { drawRectangle } from "./shapes2d.js";
import { initBuffers } from "./buffers.js";
import { drawScene } from "./drawscene.js";
import { Camera } from "./camera.js";

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
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //
  // Create shaders
  //
  const vertexShaderText = await (await fetch("simple.vs")).text();
  const fragmentShaderText = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText,
  );

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition : gl.getAttribLocation(shaderProgram,"vertPosition")
    },
    uniformLocations: {
      colorVector : gl.getUniformLocation(shaderProgram,"uColor"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram,"uModelViewMatrix"),
      projectionMatrix: gl.getUniformLocation(shaderProgram,"uProjectionMatrix")
    }
  }

  const buffers = initBuffers(gl)
  //
  // load a projection matrix onto the shader
  //
  let h = 16;
  let w = 15;
  const MARGIN = 0.5;
  let xlow = -MARGIN;
  let xhigh = w + MARGIN;
  let ylow = -MARGIN;
  let yhigh = h + MARGIN;
  
  const m = new Maze(w, h);
  const rat = new Rat(m.start + 0.5, 0.5, Math.PI / 2);
  const camera = new Camera(w/2,-.5,Math.PI / 2)

  let currentView = "topView";
  let canvasAspect;
  let mazeAspect;
  let aspect;


  const projectionMatrix = mat4.create();
  window.addEventListener("resize", reportWindowSize);
  function reportWindowSize() {
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    canvasAspect = gl.canvas.width / gl.canvas.height;
    mazeAspect = (w + MARGIN * 2) / (h + MARGIN * 2);
    aspect = canvasAspect / mazeAspect;
    
    switch (currentView) {
      case "observerView":
        UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, w, h,camera);
        break;
        
      case "ratView":
        console.log(currentView)
        UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat);
        break;
        
        case "topView":
          UpdateTopView(gl, programInfo, projectionMatrix, w, h, MARGIN, aspect, xlow, xhigh, ylow, yhigh);
          break;
        }
      }
      reportWindowSize();
      
    gl.useProgram(programInfo.program);
  //
  // Create content to display
  //
  let spinLeft = false;
  let spinRight = false;
  let scurryForward = false;
  let scurryBackward = false;
  let strafeLeft = false;
  let strafeRight = false;
  let cameraForward = false;
  let cameraBackward = false;
  let cameraLeft = false;
  let cameraRight = false;




  window.addEventListener("keydown", keyDown);
  function keyDown(event) {
    if (event.code == "KeyW") {
      scurryForward = true;
    }
    if (event.code == "KeyS") {
      scurryBackward = true;
    }
    if (event.code == "KeyQ") {
      spinLeft = true;
    }
    if (event.code == "KeyE") {
      spinRight = true;
    }
    if (event.code == "KeyA") {
      strafeLeft = true;
    }
    if (event.code == "KeyD") {
      strafeRight = true;
    }
     if (event.code == 'KeyT') {
      currentView = "topView"
      UpdateTopView(gl, programInfo, projectionMatrix, w, h, MARGIN, aspect, xlow, xhigh, ylow, yhigh);
    }
    if (event.code == 'KeyO'){
      currentView = "observerView"
      UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, w, h,camera);
    }
    if (event.code == 'KeyR'){
      currentView = "ratView"
      UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat);
    }
    if(event.code == "ArrowUp"){
      cameraForward = true;
    }
    if(event.code == "ArrowDown"){
      cameraBackward = true;
    }
    if(event.code == "ArrowRight"){
      cameraRight = true;
    }
    if(event.code =="ArrowLeft")
      cameraLeft = true;
  }
  window.addEventListener("keyup", keyUp);
  function keyUp(event) {
    if (event.code == "KeyW") {
      scurryForward = false;
    }
    if (event.code == "KeyS") {
      scurryBackward = false;
    }
    if (event.code == "KeyQ") {
      spinLeft = false;
    }
    if (event.code == "KeyE") {
      spinRight = false;
    }
    if (event.code == "KeyA") {
      strafeLeft = false;
    }
    if (event.code == "KeyD") {
      strafeRight = false;
    }
    if (event.code == "ArrowUp"){
      cameraForward = false;
    }
    if (event.code == "ArrowDown"){
      cameraBackward = false;
    }
    if(event.code == "ArrowRight"){
      cameraRight = false;
    }
    if(event.code == "ArrowLeft"){
      cameraLeft = false;
    }
    if(event.code == "KeyH"){
      m.height += 1
    }
    if(event.code == "KeyN"){
      m.height -= 1
    }
    if(event.code == "KeyJ"){
      m.width += 1
    }
    if(event.code == "KeyM"){
      m.width -= 1
    }

  }

  //
  // Main render loop
  //
  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DeltaT = currentTime - previousTime;
    if (DeltaT > 0.1) DeltaT = 0.1;
    previousTime = currentTime;

  if (spinLeft) rat.spinLeft(DeltaT);
  if (scurryForward) rat.scurryForward(DeltaT, m);
  if (scurryBackward) rat.scurryBackward(DeltaT, m);
  if (spinRight) rat.spinRight(DeltaT);
  if (strafeLeft) rat.strafeLeft(DeltaT, m);
  if (strafeRight) rat.strafeRight(DeltaT, m);
  if (currentView == "observerView") {
  if (cameraForward) camera.moveForward(DeltaT);
  if (cameraBackward) camera.moveBackward(DeltaT);
  if (cameraLeft) camera.spinLeft(DeltaT);   // arrow keys now spin
  if (cameraRight) camera.spinRight(DeltaT);
}

    // This will always fill the whole canvas with whatever was specified in gl.clearColor.

    // Reset the ModelViewMatrix to Identity (or something else) for each item you draw:
    if(currentView == "ratView"){
       UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat);
    }

  if (currentView == "observerView") {
  UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, w, h, camera);
}
    
    // for demonstrative purposes.
    // 		This rectangle will fill only the smaller viewport when altering gl.viewport to fix aspect ratio.
    //		This rectangle will fill the whole canvas when altering ortho to fix aspect ratio.

    drawScene(gl, programInfo, buffers, m, rat, currentView);
    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}



function UpdateTopView(gl, programInfo, projectionMatrix, mazeWidth, mazeHeight, margin, aspect, xlow, xhigh, ylow, yhigh) {
  if (aspect > 1) {
    const fw = gl.canvas.width * (mazeHeight + 2 * margin) / gl.canvas.height;
    const nxm = (fw - mazeWidth) / 2
    mat4.ortho(projectionMatrix, -nxm, mazeWidth + nxm, ylow, yhigh, -1, 1);
  }

  else {
    const fh = gl.canvas.height * (mazeWidth + 2 * margin) / gl.canvas.width;
    const nym = (fh - mazeHeight) / 2
    mat4.ortho(projectionMatrix, xlow, xhigh, -nym, mazeHeight + nym, -1, 1);
  }

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
}
function UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, mazeWidth, mazeHeight, camera) {
  const fovy = Math.PI / 2;
  const near = .2;
  const far = 100;
  mat4.perspective(projectionMatrix, fovy, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const eye = [camera.x, camera.y, 9];
  const center = [
    camera.x + Math.cos(camera.radians), 
    camera.y + Math.sin(camera.radians), 
    -2  // same z so we look horizontally
  ];
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, center, up);

  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
}

function UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat) {
  const fovy = Math.PI / 2;
  const near = .1;
  const far = 100;
  mat4.perspective(projectionMatrix, fovy, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const eye = [rat.x, rat.y, .3];
  const center = [rat.x + Math.cos(rat.radians), rat.y + Math.sin(rat.radians), .4]
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, center, up);

  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
}