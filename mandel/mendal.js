import { Point2 } from "./point2.js";

export class Bezier {
  constructor(p0, p1, p2, p3, color = [1, 1, 1, 1], pickRadiusWorld = 0.4) {
    this.p = [p0, p1, p2, p3];
    this.color = color;
    this.pickRadius = pickRadiusWorld;
  }

  setPoint(i, x, y) {
    this.p[i].set(x, y);
  }

  // cubic bezier evaluation
  evaluate(t) {
    const p0 = this.p[0],
      p1 = this.p[1],
      p2 = this.p[2],
      p3 = this.p[3];
    const u = 1 - t;

    const x =
      p0.x * u * u * u +
      3 * p1.x * u * u * t +
      3 * p2.x * u * t * t +
      p3.x * t * t * t;

    const y =
      p0.y * u * u * u +
      3 * p1.y * u * u * t +
      3 * p2.y * u * t * t +
      p3.y * t * t * t;

    return new Point2(x, y);
  }

  // returns index 0..3 or -1
  isPicked(x, y) {
    for (let i = 0; i < 4; i++) {
      const dx = x - this.p[i].x;
      const dy = y - this.p[i].y;
      if (dx * dx + dy * dy <= this.pickRadius * this.pickRadius) return i;
    }
    return -1;
  }

  // Draw approx curve with ~20 points as a LINE_STRIP
  drawCurve(gl, positionAttribLoc) {
    const N = 20;
    const verts = new Float32Array((N + 1) * 2);

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const pt = this.evaluate(t);
      verts[i * 2 + 0] = pt.x;
      verts[i * 2 + 1] = pt.y;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLoc);

    gl.drawArrays(gl.LINE_STRIP, 0, N + 1);

    gl.deleteBuffer(buf);
  }

  // Draw 4 control points (simple way: draw as POINTS first)
  drawControlPoints(gl, positionAttribLoc) {
    const verts = new Float32Array(8);
    for (let i = 0; i < 4; i++) {
      verts[i * 2 + 0] = this.p[i].x;
      verts[i * 2 + 1] = this.p[i].y;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLoc);

    // easiest “circles” replacement: use gl.POINTS
    // If you *must* draw circles, you can reuse your circle method around each point.
    gl.drawArrays(gl.POINTS, 0, 4);

    gl.deleteBuffer(buf);
  }
  drawControlPolygon(gl, positionAttribLoc) {
    const verts = new Float32Array([
      this.p[0].x,
      this.p[0].y,
      this.p[1].x,
      this.p[1].y,
      this.p[2].x,
      this.p[2].y,
      this.p[3].x,
      this.p[3].y,
    ]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLoc);

    gl.drawArrays(gl.LINE_STRIP, 0, 4);
    gl.deleteBuffer(buf);
  }

  // Add:
  drawSingleControlPoint(gl, positionAttribLoc, i) {
    const verts = new Float32Array([this.p[i].x, this.p[i].y]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLoc);

    gl.drawArrays(gl.POINTS, 0, 1);
    gl.deleteBuffer(buf);
  }
}
