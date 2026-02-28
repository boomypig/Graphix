import { drawCircle, drawRectangle, drawTriangle, drawLineStrip, drawLines } from "./shapes2d.js";
import { randomDouble, randomIntExclusive } from "./random.js";

class Cell {
    constructor() {
        this.left = true;
        this.bottom = true;
        this.right = true;
        this.top = true;
        this.visited = false;
    }

    // Remember that x is the column number and y is the row number.
    // So (x,y) is passed in from (c,r), not the standard cell ordring of (r,c).
    draw(gl, shaderProgram, x, y) {
        const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
        const modelViewMatrix = mat4.create();
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

        const vertices = [];

        if (this.left) {
            vertices.push(x, y, x, y + 1);
        }
        if (this.bottom) {
            vertices.push(x, y, x + 1, y);
        }
        if (this.right) {
            vertices.push(x + 1, y, x + 1, y + 1);
        }
        if (this.top) {
            vertices.push(x, y + 1, x + 1, y + 1);
        }

        drawLines(gl, shaderProgram, vertices, [0, 0, 0, 1]);

    }
}

class Maze {
    constructor(width, height) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.cells = [];
        for (let r = 0; r < height; r++) {
            this.cells.push([]);
            for (let c = 0; c < width; c++) {
                this.cells[r].push(new Cell());
            }
        }
    }

    draw(gl, shaderProgram) {
        for (let r = 0; r < this.HEIGHT; r++) {
            for (let c = 0; c < this.WIDTH; c++) {
                this.cells[r][c].draw(gl, shaderProgram, c, r);
            }
        }
    }

} // end of class Maze

export { Maze };