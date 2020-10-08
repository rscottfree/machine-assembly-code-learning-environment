import { ram, get16bitValue } from './ram.js';
import { memoryMap, printHex } from './memory-map.js';

let run = true;
const textColor = 0x55ffbb;
const pixelOnAlpha = 1;
const pixelOffAlpha = 0;
const charsX = 32;
const charsY = 32; // see memory-map for videoChars (video character memory)
const charsWidth = 8;
const charsHeight = 8;
const bytesPerChar = 8;
const pixelWidth = 2;
const pixelHeight = 2;
const pixelWidthDrawn = 2;
const pixelHeightDrawn = 2;
const screenWidth = charsX * charsWidth * pixelWidth;
const screenHeight = charsY * charsHeight * pixelHeight;
const startVideoMem = memoryMap['video'][0];
const endVideoMem = startVideoMem + (charsX * charsY * bytesPerChar);
const totalVidMem = endVideoMem - startVideoMem;

console.info('total video char memory', charsX * charsY, `(${printHex(charsX * charsY)})`);
console.info('total video char color memory', charsX * charsY, `(${printHex(charsX * charsY)})`);
console.info('total video memory', totalVidMem, `(${printHex(totalVidMem)})`); // -> videoMemSize in memory-map.js

let pixels = new Array(totalVidMem * bytesPerChar);

let app = new PIXI.Application({
    width: screenWidth,
    height: screenHeight,
    resolution: 1,
    autoStart: true,
});
document.querySelector('#container').appendChild(app.view);

let pi = 0; // The pixel index
let sx = 0; // The screen character x (column) index
let sy = 0; // The screen character y (row) index

// Reference for a single pixel graphic
let rectangle = new PIXI.Graphics();
rectangle.beginFill(textColor);
rectangle.alpha = 0;
rectangle.drawRect(0, 0, pixelWidthDrawn, pixelHeightDrawn);
rectangle.endFill();

// Add all pixels to the container
for (let y = 0; y < charsY; y++) { // Each row of characters
    for (let x = 0; x < charsX; x++) { // Each column of characters
        for (let cy = 0; cy < charsWidth; cy++) { // Each row of pixels in a character
            for (let cx = 0; cx < charsHeight; cx++) { // Each column of pixels in a character
                let px = ((sx * charsWidth) + cx) * pixelWidth; // * 4 because the pixels are 4 pixels wide
                let py = ((sy * charsHeight) + cy) * pixelHeight; // * 4

                const pr = rectangle.clone();
                pr.x = px;
                pr.y = py;
                app.stage.addChild(pr);
                pixels[pi] = pr;
                pi++;
            }
        }

        sx++;

        if (sx >= charsX) {
            sx = 0;
            sy++;
        }
    }
}

const chars = memoryMap['characters'][0];
const videoChars = memoryMap['videoChars'][0];
const colorChars = memoryMap['colorChars'][0];
const videoMem = memoryMap['video'][0];
const totalCharMem = charsX * charsY;
let charOffset = 0;
let charBytes = 0;
let currentCharMem = 0;
let linesPerInterval = charsX * 8;

function drawText() {
    if (!run) {
        app.stop();
        return;
    }

    // Loop through videoChars
    for (let oi = currentCharMem; oi < currentCharMem + linesPerInterval; oi++) {
        charOffset = ram[videoChars + oi] - 32;
        // console.log('charOffset', printHex(charOffset));

        // Loop through the 8 bytes of a character
        for (let ci = 0; ci < 8; ci++) {
            // console.log(printHex(ram[chars + (charOffset * 8) + ci]));
            charBytes = ram[chars + (charOffset * 8) + ci];

            // Loop through the 8 bits of this character byte
            for (let i = 0; i < 8; i++) {
                if ((charBytes & (0b10000000 >> i)) > 0) {
                    // pixels[(mi * 8) + i].tint = 0xFF0000;
                    pixels[(ci * 8) + i + (oi * 64)].alpha = pixelOnAlpha;
                } else {
                    // pixels[(mi * 8) + i].tint = 0xFFFFFF;
                    pixels[(ci * 8) + i + (oi * 64)].alpha = pixelOffAlpha;
                }
            }
        }
    }

    currentCharMem += linesPerInterval;
    if (currentCharMem >= totalCharMem) {
        currentCharMem = 0;
    }
}

function draw() {
    if (!run) {
        return;
    }

    // TODO: READ POINTER TO VIDEO MEMORY START
    // let vidStartMemVar = // pointer to mem;
    // const startMem = get16bitValue(vidStartMemVar);
    const startMem = memoryMap['video'][0];

    for (let mi = 0; mi < totalVidMem; mi++) {
        const memByte = ram[startMem + mi];
        // const memByte = getRandomIntInclusive(0, 255);

        for (let i = 0; i < 8; i++) {
            if ((memByte & (0b10000000 >> i)) > 0) {
                // pixels[(mi * 8) + i].tint = 0xFF0000;
                pixels[(mi * 8) + i].alpha = pixelOnAlpha;
            } else {
                // pixels[(mi * 8) + i].tint = 0xFFFFFF;
                pixels[(mi * 8) + i].alpha = pixelOffAlpha;
            }
        }
    }

    // ram[getRandomIntInclusive(0, totalMem)] = getRandomIntInclusive(0, 255);

    // requestAnimationFrame(draw);
}

// requestAnimationFrame(draw);
// setInterval(() => {
//     console.time();
//     draw();
//     console.timeEnd();
// }, 1000);



// draw();


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function stopVideo() {
    console.info('stopVideo');
    run = false;
}

export { stopVideo, draw, drawText };