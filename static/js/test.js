window.onload = function () {
    init();
}

var pixelator;

function init(imageObject) {
    pixelator = new Pixelator(document.getElementById("myCanvas"));
    pixelator.loadImage(img_src, animate);
}

function animate() {
    pixelator.randomBomb(0.2);
    pixelator.drawPixels();

    var animator = new Animator();
    animator.addEvent(1000, pixelator.animation);
    animator.start();
}
