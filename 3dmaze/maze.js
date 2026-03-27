import { drawLine,drawQuad, setColor } from "./drawscene.js";

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
  }else{
    const r = Math.sin(x*3712+y*34857+1)*.5+.5;            
    const g = Math.sin(x*9321+y*27543+2)*.5+.5;
    const b = Math.sin(x*1268+y*12771+7)*.5+.5;
    const color = [r,g,b,1];
    setColor(gl, programInfo, color);
    if(this.l)
      drawQuad(gl, programInfo, x,y,0, x,y+1,0, x,y+1,1, x,y,1);
    if(this.r)
      drawQuad(gl, programInfo, x+1,y,0, x+1,y+1,0, x+1,y+1,1, x+1,y,1);
      setColor(gl, programInfo, [g,b,r,1]);
    if(this.b)
      drawQuad(gl, programInfo, x,y,0, x+1,y,0, x+1,y,1, x,y,1);
    if(this.t)
      drawQuad(gl, programInfo, x,y+1,0, x+1,y+1,0, x+1,y+1,1, x,y+1,1);
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
