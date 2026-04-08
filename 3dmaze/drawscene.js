function drawRat(gl, programInfo, buffers, x, y, radians) {
  setPositionOnlyAttribute(gl, buffers.ratBuffer, programInfo);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, radians, [0, 0, 1]);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  const offset = 0;
  const vertexCount = buffers.ratBufferLength;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

function drawLine(gl, programInfo, vertices) {
  const lineBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  setPositionOnlyAttribute(gl, lineBuffer, programInfo);

  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.LINES, 0, vertices.length / 3);
}

function drawQuad(gl, programInfo, x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

  const vertices = new Float32Array([
    x1, y1, z1,
    x2, y2, z2,
    x3, y3, z3,
    x4, y4, z4,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  setPositionOnlyAttribute(gl, quadBuffer, programInfo);

  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawTexturedQuad(
  gl,
  programInfo,
  x1, y1, z1, u1, v1, i1,
  x2, y2, z2, u2, v2, i2,
  x3, y3, z3, u3, v3, i3,
  x4, y4, z4, u4, v4, i4
) {
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

  const vertices = new Float32Array([
    x1, y1, z1, u1, v1, i1,
    x2, y2, z2, u2, v2, i2,
    x3, y3, z3, u3, v3, i3,

    x1, y1, z1, u1, v1, i1,
    x3, y3, z3, u3, v3, i3,
    x4, y4, z4, u4, v4, i4,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  setTexturedAttributes(gl, quadBuffer, programInfo);

  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function setColor(gl, programInfo, color) {
  gl.uniform4fv(programInfo.uniformLocations.colorVector, color);
}

function drawScene(gl, programInfo, buffers, maze, rat, currentView) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setColor(gl, programInfo, [0.9, 0, 0.5, 1]);
  maze.draw(gl, programInfo, currentView);

  setColor(gl, programInfo, [0.8, 0.3, 0.2, 1.0]);
  drawRat(gl, programInfo, buffers, rat.x, rat.y, rat.radians);
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

function setTexturedAttributes(gl, buffer, programInfo) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexUV,
    2,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexUV);

  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexIndex,
    1,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    5 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexIndex);
}

export { drawScene, drawLine, drawQuad, drawTexturedQuad, setColor };