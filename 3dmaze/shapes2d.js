function drawCircle(gl, shaderProgram, x, y, radius, color = [0, 0, 1, 1]) {
  const sides = 64;
  const vertices = CreateCircleVertices(x, y, radius, sides);
  drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLE_FAN);
}

function drawLineStrip(gl, shaderProgram, vertices, color = [0, 0, 0, 1]) {
  drawVertices(gl, shaderProgram, vertices, color, gl.LINE_STRIP);
}

function drawLineLoop(gl, shaderProgram, vertices, color = [0, 0, 0, 1]) {
  drawVertices(gl, shaderProgram, vertices, color, gl.LINE_LOOP);
}
function CreateCircleVertices(x, y, radius, sides) {
  const vertices = [];
  vertices.push(x);
  vertices.push(y);
  for (let i = 0; i < sides + 1; i++) {
    const radians = (i / sides) * 2 * Math.PI;
    vertices.push(x + radius * Math.cos(radians));
    vertices.push(y + radius * Math.sin(radians));
  }
  return vertices;
}

function drawRectangle(
  gl,
  shaderProgram,
  x1,
  y1,
  x2,
  y2,
  color = [0, 1, 0, 1],
) {
  const vertices = [x1, y1, x2, y1, x1, y2, x2, y2]; // triangle strip order
  drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLE_STRIP);
}

function drawTriangles(gl, shaderProgram, triangleList, x, y, radians) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleList),
    gl.STATIC_DRAW,
  );

  setPositionAttribute(gl, shaderProgram, buffer);

  const modelViewMatrix = mat4.create();

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [x, y, 0],
  ); // amount to translate

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    radians,
    [0, 0, 1],
  ); // amount to translate
  const uniformLocations = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix",
  );
  // Set the shader uniforms
  gl.uniformMatrix4fv(uniformLocations, false, modelViewMatrix);

  // Draw triangle code:
  const offset = 0;
  const vertexCount = triangleList.length / 2;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

function drawLines(gl, shaderProgram, vertices, color = [0, 0, 0, 1]) {
  drawVertices(gl, shaderProgram, vertices, color, gl.LINES);
}

function drawVertices(gl, shaderProgram, vertices, color, style) {
  const vertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(
    shaderProgram,
    "vertPosition",
  );
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0, // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
  gl.uniform4fv(colorUniformLocation, color);

  gl.drawArrays(style, 0, vertices.length / 2);
}

function setPositionAttribute(gl, shaderProgram, buffer) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const attriLocation = gl.getAttribLocation(shaderProgram, "vertPosition");
  gl.vertexAttribPointer(
    attriLocation,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(attriLocation);
}

export { drawTriangles, drawLines, drawRectangle };
