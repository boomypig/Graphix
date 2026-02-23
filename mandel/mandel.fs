precision mediump float;

const int MAX_ITER = 256;
varying vec2 v_pos;

int MandelbrotTest(float cr, float ci) {
    int count = 0;
    float zr = 0.0;
    float zi = 0.0;

    for (int i = 0; i < MAX_ITER; i++) {
        float zrsqr = zr * zr;
        float zisqr = zi * zi;
        if (zrsqr + zisqr > 4.0) break;

        float newZi = 2.0 * zr * zi + ci;
        float newZr = zrsqr - zisqr + cr;
        zr = newZr;
        zi = newZi;

        count++;
    }
    return count;
}

void main() {
    float cr = v_pos.x;
    float ci = v_pos.y;

    int it = MandelbrotTest(cr, ci);

    float t = float(it) / float(MAX_ITER);
    gl_FragColor = vec4(vec3(t), 1.0);
}