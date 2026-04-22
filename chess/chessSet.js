import { setShaderAttributes, loadTexture } from "./helpers.js";

class ChessSet {
    constructor() {
        // pieces: { type, color, col, row }
        this.pieces = [];
        const backRank = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
        for (let i = 0; i < 8; i++)
            this.pieces.push({ type: backRank[i], color: 'white', col: i+1, row: 1 });
        for (let c = 1; c <= 8; c++)
            this.pieces.push({ type: 'pawn', color: 'white', col: c, row: 2 });
        for (let i = 0; i < 8; i++)
            this.pieces.push({ type: backRank[i], color: 'black', col: i+1, row: 8 });
        for (let c = 1; c <= 8; c++)
            this.pieces.push({ type: 'pawn', color: 'black', col: c, row: 7 });

        // Scandinavian Defense: 1.e4 d5 2.exd5 Nf6 3.Nc3 Bg4
        // pi=piece index, captureIndex=piece removed on arrival, t=start time, dur=duration
        this.moves = [
            { pi: 12, toCol: 5, toRow: 4,                    t:  2.0, dur: 1.5 },  // 1. e4
            { pi: 27, toCol: 4, toRow: 5,                    t:  5.0, dur: 1.5 },  // 1... d5
            { pi: 12, toCol: 4, toRow: 5, captureIndex: 27,  t:  8.0, dur: 1.5 },  // 2. exd5
            { pi: 22, toCol: 6, toRow: 6,                    t: 11.0, dur: 1.5 },  // 2... Nf6
            { pi:  1, toCol: 3, toRow: 3,                    t: 14.0, dur: 1.5 },  // 3. Nc3
            { pi: 18, toCol: 7, toRow: 4,                    t: 17.0, dur: 1.5 },  // 3... Bg4
        ];
        this.loopDuration = 24.0;
    }

    async init(gl) {
        this.blackTexture = loadTexture(gl, 'pieces/PiezasAjedrezDiffuseMarmolBlackBrighter.png', [80, 80, 80, 255]);
        this.whiteTexture = loadTexture(gl, 'pieces/PiezasAjedrezDiffuseMarmol.png', [220, 220, 220, 255]);
        this.boardTexture = loadTexture(gl, 'pieces/TableroDiffuse01.png', [255, 171, 0, 255]);
        this.buffers = {};
        await readObj(gl, "pieces/PiezasAjedrezAdjusted.obj", this.buffers);
    }

    // tx goes to the right. ty is up. tz come toward the viewer (playing the white pieces)
    // using tx=0 and tz=0 would land the piece at the cross hairs in the middle of the board.
    // Use tx=-1.5 and tz=3.5 to get white's left bishop where it goes.
    // Since we want to say that white's left bishop goes at column 3, row 1,
    //      call the drawAt function to convert (3,1) to (-1.5, 3.5)
    drawItem(gl, shaderProgram, itemName, tx=0, ty=0, tz=0, sx=1, sy=1, sz=1, radians=0, rx=0, ry=0, rz=0) {
        // create and set modevViewMatrix:
        const modelViewMatrix = mat4.create();

        mat4.translate(modelViewMatrix, modelViewMatrix, [tx, ty, tz]); // modelView = modelView * createdTranslationMatrix
        mat4.scale(modelViewMatrix, modelViewMatrix, [ sx, sy, sz]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, radians, [rx, ry, rz]);

        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelViewMatrix"), false, modelViewMatrix);

        // create and set normalMatrix:
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, modelViewMatrix);
        gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "uNormalMatrix"), false, normalMatrix);

        // draw the current item:
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[itemName]);
        setShaderAttributes(gl, shaderProgram);
        gl.drawArrays(gl.TRIANGLES, 0, this.buffers[itemName].vertexCount);
    }

    drawAt(gl, shaderProgram, itemName, atx=0, aty=0, atz=0, sx=1, sy=1, sz=1, degrees=0, rx=0, ry=0, rz=0) {
        // make atz=1 map to tz=3.5 and atz=2 to tz=2.5
        const radians = degrees*Math.PI/180.0;
        this.drawItem(gl, shaderProgram, itemName, atx-4.5, aty, -atz+4.5, sx, sy, sz, radians, rx, ry, rz) ;
    }

    draw(gl, shaderProgram, currentTime) {
        const t = currentTime % this.loopDuration;

        // compute current piece positions and captured set
        const positions = this.pieces.map(p => ({ col: p.col, row: p.row, arc: 0 }));
        const captured = new Set();

        for (const move of this.moves) {
            if (t < move.t) break;
            const progress = Math.min((t - move.t) / move.dur, 1.0);
            if (progress >= 1.0) {
                if (move.captureIndex !== undefined) captured.add(move.captureIndex);
                positions[move.pi] = { col: move.toCol, row: move.toRow, arc: 0 };
            } else {
                const from = positions[move.pi];
                positions[move.pi] = {
                    col: from.col + (move.toCol - from.col) * progress,
                    row: from.row + (move.toRow - from.row) * progress,
                    arc: Math.sin(progress * Math.PI) * 1.5
                };
            }
        }

        // Set the board texture and draw the board:
        gl.bindTexture(gl.TEXTURE_2D, this.boardTexture);
        this.drawItem(gl, shaderProgram, "cube");

        // Set the white pieces texture and draw white pieces:
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        for (let i = 0; i < this.pieces.length; i++) {
            if (captured.has(i) || this.pieces[i].color !== 'white') continue;
            const pos = positions[i];
            this.drawAt(gl, shaderProgram, this.pieces[i].type, pos.col, pos.arc, pos.row);
        }

        // Set the black pieces texture and draw black pieces:
        gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
        for (let i = 0; i < this.pieces.length; i++) {
            if (captured.has(i) || this.pieces[i].color !== 'black') continue;
            const pos = positions[i];
            this.drawAt(gl, shaderProgram, this.pieces[i].type, pos.col, pos.arc, pos.row, 1, 1, 1, 180, 0, 1, 0);
        }
    }
}

// Read the objects inside the filename, which should be in .obj format.
// Put them in the dictionary this.buffers.
async function readObj(gl, filename, buffers) {
    const response = await fetch(filename);
    const text = await response.text()

    const lines = text.split("\n");
    let objectName = "";
    const vertexList = [];
    const normalList = [];
    const uvList = [];
    let currentFaceList = [];

    for (const line of lines) {
        const values = line.split(' ');
        if (values[0] == 'o') {
            if (currentFaceList.length > 0) {
                AddVertexBufferObject(gl, buffers, objectName, vertexList, uvList, normalList, currentFaceList)
                currentFaceList = []
            }
            objectName = values[1];
        }
        else if (values[0] == 'v') {
            vertexList.push(parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3]))
        }
        else if (values[0] == 'vn') {
            normalList.push(parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3]))
        }
        else if (values[0] == 'vt') {
            uvList.push(parseFloat(values[1]), 1 - parseFloat(values[2]))
        }
        else if (values[0] == 'f') {
            const numVerts = values.length - 1;
            const fieldsV0 = values[1].split('/');
            for (let i = 2; i < numVerts; i++) {
                const fieldsV1 = values[i].split('/');
                const fieldsV2 = values[i + 1].split('/');
                currentFaceList.push(parseInt(fieldsV0[0]) - 1, parseInt(fieldsV0[1]) - 1, parseInt(fieldsV0[2]) - 1);
                currentFaceList.push(parseInt(fieldsV1[0]) - 1, parseInt(fieldsV1[1]) - 1, parseInt(fieldsV1[2]) - 1);
                currentFaceList.push(parseInt(fieldsV2[0]) - 1, parseInt(fieldsV2[1]) - 1, parseInt(fieldsV2[2]) - 1);
            }
        }
    }
    if (currentFaceList.length > 0) {
        AddVertexBufferObject(gl, buffers, objectName, vertexList, uvList, normalList, currentFaceList)
    }
}


function AddVertexBufferObject(gl, buffers, objectName, vertexList, uvList, normalList, currentFaceList) {
    const vertices = [];
    for (let i = 0; i < currentFaceList.length; i += 3) {
        const vertexIndex = currentFaceList[i] * 3;
        const uvIndex = currentFaceList[i + 1] * 2;
        const normalIndex = currentFaceList[i + 2] * 3;
        vertices.push(vertexList[vertexIndex + 0], vertexList[vertexIndex + 1], vertexList[vertexIndex + 2], // x,y,x
            uvList[uvIndex + 0], uvList[uvIndex + 1], // u,v
            normalList[normalIndex + 0], normalList[normalIndex + 1], normalList[normalIndex + 2] // nx,ny,nz
        );
    }

    const vertexBufferObject = gl.createBuffer();
    vertexBufferObject.vertexCount = vertices.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    buffers[objectName] = vertexBufferObject;
}

export { ChessSet };
