import { initShaderProgram } from "./shader.js";
import { Terrain } from "./terrain.js";
import { Rat } from "./rat.js";
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
      vertexPosition: gl.getAttribLocation(shaderProgram, "vertPosition"),
      vertexUV: gl.getAttribLocation(shaderProgram, "vertUV"),
      vertexIndex: gl.getAttribLocation(shaderProgram, "vertIndex"),
    },
    uniformLocations: {
      colorVector: gl.getUniformLocation(shaderProgram, "uColor"),
      defaultColor: gl.getUniformLocation(shaderProgram, "uDefaultColor"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      texture0: gl.getUniformLocation(shaderProgram, "uTexture0"),
    },
  };

  const buffers = initBuffers(gl)
  //
  // load a projection matrix onto the shader
  //
  
  const terrain = new Terrain(50, 120, -2.5);
  const rat = new Rat(0, 0, 0, terrain);
  const camera = new Camera(0, 0, Math.PI / 4, terrain);

  let currentView = "observerView";
  let canvasAspect;
  

  const projectionMatrix = mat4.create();
  window.addEventListener("resize", reportWindowSize);
  function reportWindowSize() {
  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  canvasAspect = gl.canvas.width / gl.canvas.height;

  switch (currentView) {
    case "observerView":
      UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, terrain, camera);
      break;

    case "ratView":
      UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat);
      break;
  }
}
      reportWindowSize();
      
    gl.useProgram(programInfo.program);
    gl.uniform4fv(programInfo.uniformLocations.defaultColor, [1, 1, 1, 1]);
    loadTexture(gl, programInfo.program, "wall-4-granite-TEX.jpg", 0);
    gl.uniform1i(programInfo.uniformLocations.texture0, 0);
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
if (scurryForward) rat.scurryForward(DeltaT, terrain);
if (scurryBackward) rat.scurryBackward(DeltaT, terrain);
if (spinRight) rat.spinRight(DeltaT);
if (strafeLeft) rat.strafeLeft(DeltaT, terrain);
if (strafeRight) rat.strafeRight(DeltaT, terrain);

if (currentView == "observerView") {
  if (cameraForward) camera.moveForward(DeltaT, terrain);
  if (cameraBackward) camera.moveBackward(DeltaT, terrain);
  if (cameraLeft) camera.spinLeft(DeltaT);
  if (cameraRight) camera.spinRight(DeltaT);
}

    // This will always fill the whole canvas with whatever was specified in gl.clearColor.

    // Reset the ModelViewMatrix to Identity (or something else) for each item you draw:
    if(currentView == "ratView"){
       UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat);
    }

  if (currentView == "observerView") {
  UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, terrain, camera);
}
    
    // for demonstrative purposes.
    // 		This rectangle will fill only the smaller viewport when altering gl.viewport to fix aspect ratio.
    //		This rectangle will fill the whole canvas when altering ortho to fix aspect ratio.

    drawScene(gl, programInfo, buffers, terrain, rat);
    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}


function UpdateObserverView(gl, programInfo, projectionMatrix, canvasAspect, terrain, camera) {
  const fovy = Math.PI / 3;
  const near = 0.1;
  const far = 300;
  mat4.perspective(projectionMatrix, fovy, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();

  const followDistance = terrain.size * 0.45;
  const followHeight = terrain.size * 0.30;

  const centerX = camera.x;
  const centerY = camera.y;
  const centerZ = terrain.getSurfaceHeight(centerX, centerY);

  const eye = [
    centerX - Math.cos(camera.radians) * followDistance,
    centerZ + followHeight,
    centerY - Math.sin(camera.radians) * followDistance
  ];

  const center = [
    centerX,
    centerZ,
    centerY
  ];

  const up = [0, 1, 0];

  mat4.lookAt(lookAtMatrix, eye, center, up);
  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
}

function UpdateRatView(gl, programInfo, projectionMatrix, canvasAspect, rat) {
  const fovy = Math.PI / 2;
  const near = 0.1;
  const far = 200;
  mat4.perspective(projectionMatrix, fovy, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();

  const eye = [rat.x, rat.z + 0.3, rat.y];
  const center = [
    rat.x + Math.cos(rat.radians),
    rat.z + 0.3,
    rat.y + Math.sin(rat.radians)
  ];
  const up = [0, 1, 0];

  mat4.lookAt(lookAtMatrix, eye, center, up);
  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
}
function loadTexture(gl, shaderProgram, fileName, textureImageUnit, tempColor = [180, 180, 180, 255]) {
  gl.activeTexture(gl.TEXTURE0 + textureImageUnit);

  const textureObject = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureObject);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(tempColor)
  );

  const image = new Image();
  image.src = fileName;

  image.onload = function () {
    gl.activeTexture(gl.TEXTURE0 + textureImageUnit);
    gl.bindTexture(gl.TEXTURE_2D, textureObject);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  };

  return textureObject;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}