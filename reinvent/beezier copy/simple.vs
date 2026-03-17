precision mediump float;

attribute vec2 vertPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 0.0, 1.0);
  gl_PointSize = 14.0; // makes control points easier to see/click
}
