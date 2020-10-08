let app = new PIXI.Application({
    width: 640,
    height: 400,
    resolution: 1,
});

// const canvas = app.canvas;

document.body.appendChild(app.view);
const canvas = app.canvas;

canvas.width = 640;
canvas.height = 400;
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
var pix = ctx.createImageData(canvas.width, canvas.height);
for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
        var colorRGBA = getColor(x, y);
        pix.data[inc++] = colorRGBA.r;
        pix.data[inc++] = colorRGBA.g;
        pix.data[inc++] = colorRGBA.b;
        pix.data[inc++] = colorRGBA.a;
    }
}

ctx.putImageData(pix, 0, 0);

//drawing procedural texture and use it as a PIXI sprite
var sprite = new PIXI.Sprite(PIXI.Texture.Draw(canvas => {
    //we are now in a 2D context
    //you need to specify your canvas width and height otherwise it'll have a size of 0x0 and you'll get an empty sprite
    canvas.width = 640;
    canvas.height = 400;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var pix = ctx.createImageData(canvas.width, canvas.height);
    for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
            var colorRGBA = getColor(x, y);
            pix.data[inc++] = colorRGBA.r;
            pix.data[inc++] = colorRGBA.g;
            pix.data[inc++] = colorRGBA.b;
            pix.data[inc++] = colorRGBA.a;
        }
    }

    ctx.putImageData(pix, 0, 0);
}));

app.stage.addChild(sprite);
