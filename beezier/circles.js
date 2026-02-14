import { collideParticles } from "./collisions.js";

const BALL_WALL_FRICTION = 0.8;
const AIR_FRICTION = 0.999;
const BALL_BALL_FRICTION = 0.9;
const GRAVITY = -8;
class Circle {
  constructor(xhigh, xlow, yhigh, ylow, xWorld, yWorld) {
    this.color = [Math.random(), Math.random(), Math.random(), 1];
    this.sides = 64;
    this.xhigh = xhigh;
    this.xlow = xlow;
    this.yhigh = yhigh;
    this.ylow = ylow;
    // HERE WE SHOULD BE ABLE TO MAKE A RANDOM SIZE CIRCLE IN RANDOM SPOT
    this.radius = 1.0 + Math.random();
    const minx = xlow + this.radius;
    const maxx = xhigh - this.radius;
    this.x = xWorld;
    const miny = ylow + this.radius;
    const maxy = yhigh - this.radius;
    this.y = yWorld;

    this.dx = Math.random() * 8 + 8;
    this.dy = Math.random() * 8 + 8;
    if (Math.random() < 0.5) {
      this.dy = -this.dy;
    }
    if (Math.random() < 0.5) {
      this.dx = -this.dx;
    }
  }
  wallCollision(DT) {
    if (this.x + this.dx * DT + this.radius > this.xhigh) {
      this.dx = -Math.abs(this.dx) * BALL_WALL_FRICTION;
    }
    if (this.x + this.dx * DT - this.radius < this.xlow) {
      this.dx = Math.abs(this.dx) * BALL_WALL_FRICTION;
    }
    if (this.y + this.dy * DT + this.radius > this.yhigh) {
      this.dy = -Math.abs(this.dy) * BALL_WALL_FRICTION;
    }
    if (this.y + this.dy * DT - this.radius < this.ylow) {
      this.dy = Math.abs(this.dy) * BALL_WALL_FRICTION;
    }

    // THIS IS THE VELOCITY CHANGING THE POSITION
    this.x += this.dx * DT;
    this.y += this.dy * DT;
  }

  updateCollisions(DT, circleArray, myindex) {
    for (let i = myindex + 1; i < circleArray.length; i++) {
      const distanceSquared =
        (this.x + this.dx * DT - circleArray[i].x - circleArray[i].dx * DT) **
          2 +
        (this.y + this.dy * DT - circleArray[i].y - circleArray[i].dy * DT) **
          2;
      if (distanceSquared < (this.radius + circleArray[i].radius) ** 2) {
        const other = circleArray[i];

        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rSum = this.radius + other.radius;

        // If dist is 0, pick an arbitrary direction to avoid NaN
        const nx = dist === 0 ? 1 : dx / dist;
        const ny = dist === 0 ? 0 : dy / dist;

        const overlap = rSum - dist;
        if (overlap > 0) {
          // push each circle half the overlap (small extra slop helps)
          const correction = overlap / 2 + 0.0001;
          this.x += nx * correction;
          this.y += ny * correction;
          other.x -= nx * correction;
          other.y -= ny * correction;
        }

        collideParticles(
          circleArray[myindex],
          circleArray[i],
          DT,
          BALL_BALL_FRICTION,
        );
      }
    }
  }

  update(DT) {
    this.dy += GRAVITY * DT;
    this.dy *= AIR_FRICTION;
    this.dx *= AIR_FRICTION;
    this.wallCollision(DT);

    //update gravity|friction
    //repeate update ball|ball and ball|wall
    //update position
    //make while loop make psudo ball check if it is inside other ball if not then create ball
  }
  draw(gl, shaderProgram) {
    drawCircle(
      gl,
      shaderProgram,
      this.sides,
      this.color,
      this.radius,
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
