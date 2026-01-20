
const vertexShaderText = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    void main(){
        fragColor = vertColor;
        gl_Position = vec4(vertPosition,0.0,1.0); 
    }
`; //gl posiition is where you want the triangel vec4(x,y,z,A)

const fragmentShaderText = 
`
    precision mediump float;
    varying vec3 fragColor;

    void main(){
        gl_FragColor = vec4(fragColor,1.0); 
    }
`;
main();
async function main(){
    //all this is to set up the background of where you want to draw your 
    //project the "canvas"
    console.log("Connection to js is working");
    const canvas = document.getElementById('webcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl){
        alert('your browser does not support html 5')
    };
    gl.clearColor(0.75,0.85,0.75,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // AFTER SETTING UP CANVAS
    //you want to create your shaders
    let shaderprogram = initShaderProgram(gl,vertexShaderText,fragmentShaderText);

    const triangelVertices  =
    [ // X, Y,       R, G, B
		0.0, 0.5,    1.0, 1.0, 0.0,
		-0.5, -0.5,  0.7, 0.0, 1.0,
		0.5, -0.5,   0.1, 1.0, 0.6,
    ];
    const triangelVertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangelVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangelVertices),gl.STATIC_DRAW);

    const posiitionAttribLocation = gl.getAttribLocation(shaderprogram,'vertPosition')
    gl.vertexAttribPointer(
        posiitionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0,
    )
    gl.enableVertexAttribArray(posiitionAttribLocation)

    const colorAttributeLoacation = gl.getAttribLocation(shaderprogram,'vertColor')
    gl.vertexAttribPointer(
        colorAttributeLoacation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    )

    gl.enableVertexAttribArray(colorAttributeLoacation)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function initShaderProgram(gl,vsSource,fsSource){ //vertex and fragment shader sources at top
    const vertexShader = loadShader(gl,gl.VERTEX_SHADER,vsSource)
    const fragmentShader = loadShader(gl,gl.FRAGMENT_SHADER,fsSource)
    
    //combine both the shaders into a shaderprogram

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram,vertexShader);
    gl.attachShader(shaderProgram,fragmentShader);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
        alert(
            `Unable to initialize program ${gl.getProgramInfo()}`
        );
        return null;
    }
    gl.validateProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram,gl.VALIDATE_STATUS)){
        return;
    }

    gl.useProgram(shaderProgram);
    return shaderProgram
};


function loadShader(gl,type,source){
    //create the shader frame
    const shader = gl.createShader(type);

    //grab both of the shader object and send it over
    gl.shaderSource(shader,source);
    //compile the shader program
    gl.compileShader(shader);

    //if it fails
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        alert(`An Error occured compiling shaders: ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader);
        return null;
    };

    return shader;
    
};
