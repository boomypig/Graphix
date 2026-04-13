import { drawLine, drawQuad, drawTexturedQuad, setColor } from "./drawscene.js";
class Cell {
  constructor() {
    this.l = true;
    this.r = true;
    this.b = true;
    this.t = true;
    this.v = false;
  }
  draw(gl, programInfo , x, y,currentView) {
    if (currentView == "topView"){
      if (this.l) {
        const vertices = [x, y,0, x, y + 1,0];
        drawLine(gl, programInfo, vertices);
      }
      if (this.b) {
        const vertices = [x, y,0, x + 1, y,0];
        drawLine(gl, programInfo, vertices);
      }
      if (this.r) {
        const vertices = [x + 1, y,0, x + 1, y + 1,0];
        drawLine(gl, programInfo, vertices);
      }
      if (this.t) {
        const vertices = [x, y + 1,0, x + 1, y + 1,0];
        drawLine(gl, programInfo, vertices);
      }
    } else {
    const graniteTex = 0.0;
    const brickTex = 1.0;

    const fitU1 = 0, fitV1 = 1;
    const fitU2 = 1, fitV2 = 1;
    const fitU3 = 1, fitV3 = 0;
    const fitU4 = 0, fitV4 = 0;

    const repeatCount = 3;
    const repU1 = 0, repV1 = repeatCount;
    const repU2 = repeatCount, repV2 = repeatCount;
    const repU3 = repeatCount, repV3 = 0;
    const repU4 = 0, repV4 = 0;

    if (this.l) {
      drawTexturedQuad(
  gl, programInfo,
  x,   y,   0, repU1, repV1, graniteTex,
  x,   y+1, 0, repU2, repV2, graniteTex,
  x,   y+1, 1, repU3, repV3, graniteTex,
  x,   y,   1, repU4, repV4, graniteTex
);
    }

    if (this.r) {
      drawTexturedQuad(
  gl, programInfo,
  x+1, y,   0, repU1, repV1, graniteTex,
  x+1, y+1, 0, repU2, repV2, graniteTex,
  x+1, y+1, 1, repU3, repV3, graniteTex,
  x+1, y,   1, repU4, repV4, graniteTex
);
    }

    if (this.b) {
      drawTexturedQuad(
  gl, programInfo,
  x,   y, 0, fitU1, fitV1, brickTex,
  x+1, y, 0, fitU2, fitV2, brickTex,
  x+1, y, 1, fitU3, fitV3, brickTex,
  x,   y, 1, fitU4, fitV4, brickTex
);
    }

    if (this.t) {
      drawTexturedQuad(
  gl, programInfo,
  x,   y+1, 0, fitU1, fitV1, brickTex,
  x+1, y+1, 0, fitU2, fitV2, brickTex,
  x+1, y+1, 1, fitU3, fitV3, brickTex,
  x,   y+1, 1, fitU4, fitV4, brickTex
);
    }
  }
}
}
class Maze {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    for (let r = 0; r < height; r++) {
      this.cells.push([]);
      for (let c = 0; c < width; c++) {
        this.cells[r].push(new Cell());
      }
    }
    this.start = Math.floor(Math.random() * this.width);
    this.end = Math.floor(Math.random() * this.width);
    this.removeWalls(0, this.start);
    this.cells[0][this.start].b = false;
    this.cells[this.height - 1][this.end].t = false;
  }
  draw(gl,programInfo,currentView) {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        this.cells[r][c].draw(gl, programInfo, c, r,currentView);
      }
    }
  }
  removeWalls(startR, startC) {
  const stack = [[startR, startC]];
  this.cells[startR][startC].v = true;

  const LEFT = 0, RIGHT = 1, UP = 2, DOWN = 3;

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];

    let possibilities = [];
    if (r > 0 && !this.cells[r-1][c].v) possibilities.push(DOWN);
    if (r < this.height-1 && !this.cells[r+1][c].v) possibilities.push(UP);
    if (c > 0 && !this.cells[r][c-1].v) possibilities.push(LEFT);
    if (c < this.width-1 && !this.cells[r][c+1].v) possibilities.push(RIGHT);

    if (possibilities.length == 0) {
      stack.pop();
      continue;
    }

    const go = possibilities[Math.floor(Math.random() * possibilities.length)];

    if (go == LEFT)  { this.cells[r][c].l = false; this.cells[r][c-1].r = false; stack.push([r, c-1]); this.cells[r][c-1].v = true; }
    if (go == RIGHT) { this.cells[r][c].r = false; this.cells[r][c+1].l = false; stack.push([r, c+1]); this.cells[r][c+1].v = true; }
    if (go == DOWN)  { this.cells[r][c].b = false; this.cells[r-1][c].t = false; stack.push([r-1, c]); this.cells[r-1][c].v = true; }
    if (go == UP)    { this.cells[r][c].t = false; this.cells[r+1][c].b = false; stack.push([r+1, c]); this.cells[r+1][c].v = true; }
  }
}
  isLegal(x, y, radius) {
  // keep within the bounds of the maze:
  if (x - radius < 0 || x + radius > this.width || y - radius < 0 || y + radius > this.height) return false;

  const minC = Math.floor(x - radius);
  const maxC = Math.floor(x + radius - 0.0001);
  const minR = Math.floor(y - radius);
  const maxR = Math.floor(y + radius - 0.0001);

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (r < 0 || r >= this.height || c < 0 || c >= this.width) return false;
      const cell = this.cells[r][c];

      // Check each wall of each cell the rat overlaps
      if (x - radius < c     && cell.l) return false;
      if (x + radius > c + 1 && cell.r) return false;
      if (y - radius < r     && cell.b) return false;
      if (y + radius > r + 1 && cell.t) return false;
    }
  }
  return true;
}
}

export { Maze };
