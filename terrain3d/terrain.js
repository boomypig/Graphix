class Terrain {
  constructor(size = 100, divisions = 200, waterHeight = -5) {
    this.size = size;
    this.divisions = divisions;
    this.waterHeight = waterHeight;

    this.landBuffer = null;
    this.waterBuffer = null;
    this.landVertexCount = 0;
    this.waterVertexCount = 0;

    this.textureScale = 12.0;

    // Generate random terrain parameters once at construction so
    // every page load produces a different landscape.
    this._waves = this._generateWaves();
  }

  _generateWaves() {
    // A handful of overlapping sine/cosine waves with randomised
    // frequencies, amplitudes and phase offsets.
    const r = () => Math.random();
    return [
      // large slow rolling hills
      { amp: 2.0 + r() * 2.5,  fx: 0.08 + r() * 0.07,  fy: 0.05 + r() * 0.06,  phase: r() * Math.PI * 2 },
      { amp: 1.5 + r() * 2.0,  fx: 0.06 + r() * 0.05,  fy: 0.09 + r() * 0.07,  phase: r() * Math.PI * 2 },
      // medium ridges
      { amp: 2.5 + r() * 3.0,  fx: 0.15 + r() * 0.10,  fy: 0.20 + r() * 0.10,  phase: r() * Math.PI * 2 },
      { amp: 2.0 + r() * 2.5,  fx: 0.22 + r() * 0.08,  fy: 0.12 + r() * 0.08,  phase: r() * Math.PI * 2 },
      // sharper detail
      { amp: 1.0 + r() * 1.5,  fx: 0.35 + r() * 0.15,  fy: 0.30 + r() * 0.15,  phase: r() * Math.PI * 2 },
      { amp: 0.8 + r() * 1.0,  fx: 0.40 + r() * 0.20,  fy: 0.45 + r() * 0.20,  phase: r() * Math.PI * 2 },
    ];
  }

  getHeight(x, y) {
    let z = 0;
    for (const w of this._waves) {
      z += w.amp * Math.sin(w.fx * x + w.fy * y + w.phase);
    }
    return z * 0.80;
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