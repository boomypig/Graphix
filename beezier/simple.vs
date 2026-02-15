// simple.vs
precision mediump float;

attribute vec2 vertPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 0.0, 1.0);

  // Makes control points visible if you draw them with gl.POINTS
  gl_PointSize = 12.0;
}
