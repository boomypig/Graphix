function initBuffers(gl) {
  const [ratBuffer, ratBufferLength] = initRatBuffer(gl)

  return {
    ratBuffer,
    ratBufferLength
  };
}

function initRatBuffer(gl){
  // Vertices in model-space XZ plane (y=0) so the rat lies flat on the ground.
  // Points: nose at (+0.3, 0, 0), rear-left at (-0.2, 0, +0.12), rear-right at (-0.2, 0, -0.12)
  const positions = [
     0.30, 0,  0.00,
    -0.20, 0,  0.12,
    -0.20, 0, -0.12,
  ];
  const ratBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ratBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return [ratBuffer, positions.length/3];
}

export { initBuffers };