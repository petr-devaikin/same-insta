define(['pixelator', 'animation'], function (pixelator, animation) {
    init();

    var pix;

    function init(imageObject) {
        var canvas = document.getElementById("myCanvas");
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
        pix = new pixelator.Pixelator(document.getElementById("myCanvas"));
        pix.loadImage(img_src, animate);
    }

    function animate() {
        pix.drawPixels();
        pix.centredBomb(3, { x: 40, y: 60, width: 60, height: 60 });

        var animator = new animation.Animator();
        animator.addEvent(1000, pix.animation);
        animator.start();
    }
});