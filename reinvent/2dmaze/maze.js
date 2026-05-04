import { drawLines } from "./shapes2d.js";

class Cell {
  constructor() {
    this.l = true;
    this.r = true;
    this.b = true;
    this.t = true;
    this.v = false;
  }
  draw(gl, shaderProgram, x, y) {
    if (this.l) {
      const vertices = [x, y, x, y + 1];
      drawLines(gl, shaderProgram, vertices);
    }
    if (this.b) {
      const vertices = [x, y, x + 1, y];
      drawLines(gl, shaderProgram, vertices);
    }
    if (this.r) {
      const vertices = [x + 1, y, x + 1, y + 1];
      drawLines(gl, shaderProgram, vertices);
    }
    if (this.t) {
      const vertices = [x, y + 1, x + 1, y + 1];
      drawLines(gl, shaderProgram, vertices);
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
    // this.removeWalls(0, this.start);
    // this.cells[0][this.start].b = false;
    // this.cells[this.height - 1][this.end].t = false;
  }
  draw(gl, shaderProgram) {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        this.cells[r][c].draw(gl, shaderProgram, c, r);
      }
    }
  }
  // removeWalls(r, c) {
  //   this.cells[r][c].v = true;

  //   const LEFT = 0;
  //   const RIGHT = 1;
  //   const UP = 2;
  //   const DOWN = 3;

  //   while (true) {
  //     // Collect the options of where we can go from this cell:
  //     let possibilities = [];
  //     if (r > 0 && this.cells[r - 1][c].v == false) possibilities.push(DOWN);
  //     if (r < this.height - 1 && this.cells[r + 1][c].v == false)
  //       possibilities.push(UP);
  //     if (c > 0 && !this.cells[r][c - 1].v) possibilities.push(LEFT);
  //     if (c < this.width - 1 && !this.cells[r][c + 1].v)
  //       possibilities.push(RIGHT);

  //     // Are we out of options?
  //     if (possibilities.length == 0) return;

  //     // Choose one of our options:
  //     const choice = Math.floor(Math.random() * possibilities.length);
  //     const go = possibilities[choice];

  //     // Move in the "go" direction:
  //     if (go == LEFT) {
  //       this.cells[r][c].l = false;
  //       this.cells[r][c - 1].r = false;
  //       this.removeWalls(r, c - 1);
  //     }
  //     if (go == RIGHT) {
  //       this.cells[r][c].r = false;
  //       this.cells[r][c + 1].l = false;
  //       this.removeWalls(r, c + 1);
  //     }
  //     if (go == DOWN) {
  //       this.cells[r][c].b = false;
  //       this.cells[r - 1][c].t = false;
  //       this.removeWalls(r - 1, c);
  //     }
  //     if (go == UP) {
  //       this.cells[r][c].t = false;
  //       this.cells[r + 1][c].b = false;
  //       this.removeWalls(r + 1, c);
  //     }
  //   }
  // }
  isLegal(x, y, radius) {
    const r = Math.floor(y);
    const c = Math.floor(x);
    const offsetX = x - c;
    const offsetY = y - r;

    // keep within the bounds of the maze:
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;

    // Wall checks:
    if (offsetX - radius < 0 && this.cells[r][c].l) return false;
    if (offsetX + radius > 1 && this.cells[r][c].r) return false;
    if (offsetY - radius < 0 && this.cells[r][c].b) return false;
    if (offsetY + radius > 1 && this.cells[r][c].t) return false;

    // Corner checks:
    if (offsetX - radius < 0 && offsetY - radius < 0) return false;
    if (offsetX - radius < 0 && offsetY + radius > 1) return false;
    if (offsetX + radius > 1 && offsetY - radius < 0) return false;
    if (offsetX + radius > 1 && offsetY + radius > 1) return false;

    return true; // okay to be at x,y with a fatness of radius
  }
}

export { Maze };
