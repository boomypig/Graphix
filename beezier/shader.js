function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = loadShader(gl, fsSource, gl.FRAGMENT_SHADER);
  const shaderProgram = gl.createProgram();

  gl.attatchShader(shaderProgram, vertexShader);
  gl.attatchShader(shaderProgram, fragmentShader);
  gl.linkShader(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `something wrong with linking ${gl.getProgramInfoLog(shaderProgram)}`,
    );
    return null;
  }

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    console.error(
      "ERROR validating program!",
      gl.getProgramInfoLog(shaderProgram),
    );
    return;
  }

  gl.useProgram(shaderProgram);

  return shaderProgram;
}
function loadShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.shaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `something wrong with compiling shader ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader();
    return null;
  }
  return shader;
}
export { initShaderProgram };
