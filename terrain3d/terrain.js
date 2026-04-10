class Terrain {
  constructor(size = 50, divisions = 120, waterHeight = -2.5) {
    this.size = size;
    this.divisions = divisions;
    this.waterHeight = waterHeight;

    this.landBuffer = null;
    this.waterBuffer = null;
    this.landVertexCount = 0;
    this.waterVertexCount = 0;

    this.textureScale = 8.0;
  }

  getHeight(x, y) {
  let z = 0;
  const zscale = 0.75;
  z += 2 * Math.sin(0.4 * y);
  z += 1.5 * Math.cos(0.3 * x);
  z += 4 * Math.sin(0.2 * x) * Math.cos(0.3 * y);
  z += 6 * Math.sin(0.11 * x) * Math.cos(0.03 * y);
  return z * zscale;
}

getSurfaceHeight(x, y) {
  return Math.max(this.getHeight(x, y), this.waterHeight);
}

  build(gl) {
    if (this.landBuffer && this.waterBuffer) return;

    const landVerts = [];
    const waterVerts = [];

    const half = this.size / 2;
    const step = this.size / this.divisions;

    for (let r = 0; r < this.divisions; r++) {
      for (let c = 0; c < this.divisions; c++) {
        const x1 = -half + c * step;
        const x2 = x1 + step;
        const y1 = -half + r * step;
        const y2 = y1 + step;

        const z11 = this.getHeight(x1, y1);
        const z21 = this.getHeight(x2, y1);
        const z22 = this.getHeight(x2, y2);
        const z12 = this.getHeight(x1, y2);

        const u1 = (c / this.divisions) * this.textureScale;
        const u2 = ((c + 1) / this.divisions) * this.textureScale;
        const v1 = (r / this.divisions) * this.textureScale;
        const v2 = ((r + 1) / this.divisions) * this.textureScale;

        // triangle 1
        landVerts.push(
          x1, z11, y1, u1, v1, 0,
          x2, z21, y1, u2, v1, 0,
          x2, z22, y2, u2, v2, 0
        );

        // triangle 2
        landVerts.push(
          x1, z11, y1, u1, v1, 0,
          x2, z22, y2, u2, v2, 0,
          x1, z12, y2, u1, v2, 0
        );
      }
    }

    const w = half + 2.0;

    // water plane, uses solid color because vertIndex = -1
    waterVerts.push(
      -w, this.waterHeight, -w,
       w, this.waterHeight, -w,
       w, this.waterHeight,  w,

      -w, this.waterHeight, -w,
       w, this.waterHeight,  w,
      -w, this.waterHeight,  w
    );

    this.landBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.landBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(landVerts), gl.STATIC_DRAW);
    this.landVertexCount = landVerts.length / 6;

    this.waterBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.waterBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVerts), gl.STATIC_DRAW);
    this.waterVertexCount = waterVerts.length / 3;
  }

  draw(gl, programInfo) {
    this.build(gl);

    // draw water first
    gl.bindBuffer(gl.ARRAY_BUFFER, this.waterBuffer);

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
      gl.vertexAttrib2f(programInfo.attribLocations.vertexUV, 0.0, 0.0);
    }

    if (programInfo.attribLocations.vertexIndex !== -1) {
      gl.disableVertexAttribArray(programInfo.attribLocations.vertexIndex);
      gl.vertexAttrib1f(programInfo.attribLocations.vertexIndex, -1.0);
    }

    gl.uniform4fv(programInfo.uniformLocations.colorVector, [0.1, 0.35, 0.9, 1.0]);

    let modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.drawArrays(gl.TRIANGLES, 0, this.waterVertexCount);

    // draw textured land
    gl.bindBuffer(gl.ARRAY_BUFFER, this.landBuffer);

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

    modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.drawArrays(gl.TRIANGLES, 0, this.landVertexCount);
  }
}

export { Terrain };