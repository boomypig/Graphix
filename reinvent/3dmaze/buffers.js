function initBuffers(gl) {
  const [ratBuffer, ratBufferLength] = initRatBuffer(gl)

  return {
    ratBuffer,
    ratBufferLength
  };
}

function initRatBuffer(gl){
  const positions = [.3, 0, 0, -.2, .1,0, -.2, -.1,0];
  const ratBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ratBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return [ratBuffer, positions.length/3];
}

export { initBuffers };