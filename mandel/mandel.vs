precision mediump float;

attribute vec2 vertPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 v_pos;

void main() {
    // Pass world coordinates directly to fragment shader
    v_pos = vertPosition;

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 0.0, 1.0);
}