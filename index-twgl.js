'use strict';

let pixelSize = 2.0;
let resolutionMultiplier = 4;

var vs = `
attribute vec4 position;
void main() {
  gl_Position = position;
  gl_PointSize = 2.0;
}
`;
var fs = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}`;

var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

// make canvas 1x1 with display
gl.canvas.width = gl.canvas.clientWidth * window.devicePixelRatio;
gl.canvas.height = gl.canvas.clientHeight * window.devicePixelRatio;
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

var positions = new Float32Array(64000); // 320 * 200
var bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: positions, },
});

gl.useProgram(programInfo.program);
twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

function randInt(max) {
    return Math.random() * max | 0;
}

var offset = [0, 0];
var color = [0, 0, 0, 1];
// var x = 0;
// var y = 0;

var uniforms = {
    u_offset: offset,
    u_color: color,
};

function render() {
    var length = positions.length;

    for (var i = 0; i < length; i += 2) {
        var x = randInt(gl.canvas.width);
        var y = randInt(gl.canvas.height);

        // positions[i + 0] = (x + 0.5) / gl.canvas.width * resolutionMultiplier - 1;
        // positions[i + 1] = (y + 0.5) / gl.canvas.height * resolutionMultiplier - 1;
        // positions[i + 0] = (10 + 0.5) / gl.canvas.width * resolutionMultiplier - 1;
        // positions[i + 1] = (10 + 0.5) / gl.canvas.height * resolutionMultiplier - 1;
    }

    twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, positions);

    //   var cndx = randInt(3);
    //   color[cndx] = 1;
    //   color[(cndx + 1) % 3] = 0;

    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, gl.POINTS, bufferInfo);

    //   requestAnimationFrame(render);
}

// for (var i = 0; i < length; i += 2) {
//     var x = randInt(gl.canvas.width);
//     var y = randInt(gl.canvas.height);

//     positions[i + 0] = (x + 0.5) / gl.canvas.width * resolutionMultiplier - 1;
//     positions[i + 1] = (y + 0.5) / gl.canvas.height * resolutionMultiplier - 1;
// }

positions[100] = (10 + 0.5) / gl.canvas.width * resolutionMultiplier - 1;
positions[101] = (20 + 0.5) / gl.canvas.height * resolutionMultiplier - 1;

requestAnimationFrame(render);

setTimeout(() => {
    // color[0] = 1;
    // x = 319;
    // y = 199;
    // requestAnimationFrame(render);
});