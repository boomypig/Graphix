precision mediump float;

varying vec2 fragUV;
varying float fragIndex;

uniform vec4 uColor;
uniform vec4 uDefaultColor;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;

void main() {
    if (fragIndex < -0.5) {
        gl_FragColor = uColor;
    } else if (fragIndex < 0.5) {
        gl_FragColor = texture2D(uTexture0, fragUV);
    } else if (fragIndex < 1.5) {
        gl_FragColor = texture2D(uTexture1, fragUV);
    } else {
        gl_FragColor = uDefaultColor;
    }
}