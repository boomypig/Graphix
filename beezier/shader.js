function initShaderProgram(gl, vsSource, fsSource) {
  let vertexShader = loadshader(gl, gl.VERTEX_SHADER, vsSource);
  let fragmentShader = loadshader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `cant initialize shader program ${gl.getShaderInfoLog(shaderProgram)}`,
    );
    return null;
  }
  gl.validateProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    console.error(
      `unable to validate shader `,
      gl.getProgramInfoLog(shaderProgram),
    );
  }
  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function loadshader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`error with compiling shader ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export { initShaderProgram };
