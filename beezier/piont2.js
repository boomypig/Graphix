// import { randomDouble } from "./random.js";
class Point2 {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  drawStrip(gl, shaderProgram, color = [0, 0, 0, 1]) {
    vertices = [this.x1, this.y1, this.x2, this.y2];
    drawVertices(gl, shaderProgram, vertices, color, gl.LINE_STRIP);
  }
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

export { Point2 };
