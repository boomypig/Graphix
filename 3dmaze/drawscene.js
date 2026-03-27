
function  drawRat(gl, programInfo, buffers, x, y, radians){
  setPositionAttribute(gl, buffers.ratBuffer, programInfo);

  const modelViewMatrix = mat4.create();
  
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [x, y, 0]
  ); // amount to translate  

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    radians, [0,0,1]
  ); // amount to translate

// Set the shader uniforms
gl.uniformMatrix4fv(
  programInfo.uniformLocations.modelViewMatrix,
  false,
  modelViewMatrix
);

{
  // Draw Rat code:
  const offset = 0;
  const vertexCount = buffers.ratBufferLength;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}}

function drawLine(gl, programInfo, vertices) {
  const lineBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  const lineFloats = new Float32Array(vertices);
  gl.bufferData(gl.ARRAY_BUFFER, lineFloats, gl.DYNAMIC_DRAW);

  setPositionAttribute(gl, lineBuffer, programInfo);
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    // Draw Line code:
    const offset = 0;
    gl.drawArrays(gl.LINES, offset, vertices.length/3);
  }

}

function drawQuad(gl, programInfo, x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
  const lineBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  const lineFloats = new Float32Array([x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4]);
  gl.bufferData(gl.ARRAY_BUFFER, lineFloats, gl.DYNAMIC_DRAW);

  setPositionAttribute(gl, lineBuffer, programInfo);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    // Draw Quad code:
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);
  }

}

function setColor(gl, programInfo, color){
  gl.uniform4fv(
    programInfo.uniformLocations.colorVector,
    color
  );
}

function drawScene(gl, programInfo, buffers, maze, rat, currentView) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setColor(gl, programInfo, [.9,0,.5,1]);
  maze.draw(gl, programInfo, currentView);
  setColor(gl, programInfo, [.8, 0.3, 0.2,1.0]);
  drawRat(gl, programInfo, buffers, rat.x, rat.y, rat.radians)
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffer, programInfo) {
  const numComponents = 3; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = gl.FALSE; // don't normalize
  const stride = 3*Float32Array.BYTES_PER_ELEMENT // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  //gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

export { drawScene, drawLine, drawQuad, setColor };