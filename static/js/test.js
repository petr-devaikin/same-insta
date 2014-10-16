var imageObj = new Image();

function loadCanvas(url) {
    imageObj.onload = function() {
        processImage(this);
    };

    imageObj.src = url;
}

var baseCanvas = document.getElementById('myCanvas');
var baseContext = baseCanvas.getContext('2d');

var backCanvas = document.getElementById('backCanvas');
var backContext = backCanvas.getContext('2d');


function prepareBackCanvas(image) {
    var ZOOM = 1.2;

    backContext.scale(ZOOM, ZOOM);
    var x = (backCanvas.width - image.width * ZOOM) / 2;
    var y = (backCanvas.height - image.height * ZOOM) / 2;
    backContext.drawImage(image, x, y);

    makeImageGrey(backContext, [0, 0, backCanvas.width, backCanvas.height]);
}

function makeImageGrey(context, rect) {
    var imageData = context.getImageData(rect[0], rect[1], rect[2], rect[3]);
    var data = imageData.data;

    for(var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }

    context.putImageData(imageData, 0, 0);
}


function lightning(image, opacity) {
    var backSrc = backCanvas.toDataURL();
    var greyImg = new Image();
    greyImg.onload = function() {
        baseContext.drawImage(image, 0, 0);

        baseContext.save();

        baseContext.beginPath();
        baseContext.moveTo(Math.random() * baseCanvas.width, 0);
        baseContext.lineTo(Math.random() * baseCanvas.width, baseCanvas.height);
        baseContext.lineTo(baseCanvas.width, baseCanvas.height);
        baseContext.lineTo(baseCanvas.width, 0);
        baseContext.clip();

        baseContext.globalAlpha = opacity;
        baseContext.drawImage(this, 0, 0);
        baseContext.globalAlpha = 1;

        baseContext.restore();
    };
    greyImg.src = backSrc;
}


/*function animate(canvas, context) {
    var time = (new Date()).getTime();
    var timeDelta = time - lastTime;
    lastTime = time;

    if (lastClip) {
        context.putImageData(lastClip['clip'], lastClip['left'], lastClip['top']);
    }

    var linearSpeed = 1000;
    linePosition += linearSpeed * timeDelta / 1000;
    if (linePosition >= canvas.height)
        linePosition = -1000;

    var clipTop = linePosition - 100 >= 0 ? linePosition - 100 : 0;
    var clipHeight = linePosition - clipTop;
    if (clipHeight > 0)
        lastClip = {
            clip: context.getImageData(0, clipTop, canvas.width, clipHeight),
            left: 0,
            top: clipTop
        }
    else 
        lastClip = undefined;

    context.save();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, linePosition - 1);
    context.lineTo(canvas.width, linePosition - 1);
    context.lineTo(canvas.width, 0);
    context.clip();

    context.beginPath();
    context.rect(0, linePosition, canvas.width, 10);
        
    context.shadowColor = '#fff';
    context.shadowBlur = 100;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.fill();

    context.restore();

    requestAnimFrame(function() {
        animate(canvas, context);
    });
}
*/

function processImage(image) {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    prepareBackCanvas(image);

    var animator = new Animator();
    var of = new OpacityFragment(function (opacity) { lightning(imageObj, opacity); }, 1, 0, 0.1);
    animator.addEvent(1000, of);

    animator.start();
}