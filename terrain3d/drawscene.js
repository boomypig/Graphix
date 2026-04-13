function drawRat(gl, programInfo, buffers, x, z, y, radians) {
  setPositionOnlyAttribute(gl, buffers.ratBuffer, programInfo);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [x, z + 0.15, y]);
  // gl-matrix Y-rotation maps +X to (cos θ, 0, -sin θ), but movement direction
  // is (cos θ, 0, +sin θ), so negate the angle to get the correct alignment.
  mat4.rotate(modelViewMatrix, modelViewMatrix, -radians, [0, 1, 0]);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.TRIANGLES, 0, buffers.ratBufferLength);
}

function setColor(gl, programInfo, color) {
  gl.uniform4fv(programInfo.uniformLocations.colorVector, color);
}

function drawScene(gl, programInfo, buffers, terrain, rat, skipRat = false) {
  gl.clearColor(0.65, 0.8, 0.95, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  terrain.draw(gl, programInfo);

  if (!skipRat) {
    setColor(gl, programInfo, [0.85, 0.2, 0.15, 1.0]);
    drawRat(gl, programInfo, buffers, rat.x, rat.z, rat.y, rat.radians);
  }
}

function setPositionOnlyAttribute(gl, buffer, programInfo) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    3,
    gl.FLOAT,
    false,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  if (programInfo.attribLocations.vertexUV !== -1) {
    gl.disableVertexAttribArray(programInfo.attribLocations.vertexUV);
    gl.vertexAttrib2f(programInfo.attribLocations.vertexUV, 0, 0);
  }

  if (programInfo.attribLocations.vertexIndex !== -1) {
    gl.disableVertexAttribArray(programInfo.attribLocations.vertexIndex);
    gl.vertexAttrib1f(programInfo.attribLocations.vertexIndex, -1);
  }
}

export { drawScene, setColor, setPositionOnlyAttribute };