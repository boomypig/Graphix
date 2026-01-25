class Circle {
  constructor(xhigh, xlow, yhigh, ylow) {
    this.color = [Math.random(), Math.random(), Math.random(), 1];
    this.sides = 64;
    this.xhigh = xhigh;
    this.xlow = xlow;
    this.yhigh = yhigh;
    this.ylow = ylow;
    // HERE WE SHOULD BE ABLE TO MAKE A RANDOM SIZE CIRCLE IN RANDOM SPOT
    this.size = 1.0 + Math.random();
    const minx = xlow + this.size;
    const maxx = xhigh - this.size;
    this.x = minx + Math.random() * (maxx - minx);
    const miny = ylow + this.size;
    const maxy = yhigh - this.size;
    this.y = miny + Math.random() * (maxy - miny);

    this.dx = Math.random() * 2 + 2;
    this.dy = Math.random() * 2 + 2;
    if (Math.random() < 0.5) {
      this.dy = -this.dy;
    }
    if (Math.random() < 0.5) {
      this.dx = -this.dx;
    }
  }
  update(DT) {
    if (this.x + this.dx * DT + this.size > this.xhigh) {
      this.dx = -Math.abs(this.dx);
    }
    if (this.x + this.dx * DT - this.size < this.xlow) {
      this.dx = Math.abs(this.dx);
    }
    if (this.y + this.dy * DT + this.size > this.yhigh) {
      this.dy = -Math.abs(this.dy);
    }
    if (this.y + this.dy * DT - this.size < this.ylow) {
      this.dy = Math.abs(this.dy);
    }

    // THIS IS THE VELOCITY CHANGING THE POSITION
    this.x += this.dx * DT;
    this.y += this.dy * DT;
  }
  draw(gl, shaderProgram) {
    drawCircle(
      gl,
      shaderProgram,
      this.sides,
      this.color,
      this.size,
      this.x,
      this.y,
    );
  }
}

function drawCircle(gl, shaderProgram, sides, color, size, x, y) {
  const circleVertices = createCircleVertices(sides);
  const circleBufferObject = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(circleVertices),
    gl.STATIC_DRAW,
  );

  const positionAttribute = gl.getAttribLocation(shaderProgram, "vertPosition");

  gl.vertexAttribPointer(
    positionAttribute, //where the attribute is
    2, // num of elements
    gl.FLOAT, //floats sending
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT, //size of vertex
    0, //off set of where this data starts
  );
  gl.enableVertexAttribArray(positionAttribute);

  const uniformColorLocation = gl.getUniformLocation(shaderProgram, "uColor");

  gl.uniform4fv(uniformColorLocation, color);

  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix",
  );

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
  mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, 1]);
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, sides + 2);
}

function createCircleVertices(sides) {
  const vertices = [];
  vertices.push(0);
  vertices.push(0);
  for (let i = 0; i < sides + 1; i++) {
    const radians = (i / sides) * 2 * Math.PI;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    vertices.push(x);
    vertices.push(y);
  }
  return vertices;
}

export { Circle, drawCircle };
