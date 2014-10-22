define(['pixelator', 'animation'], function (pixelator, animation) {
    var images = ['/static/01.jpg',
                  '/static/02.jpg',
                  '/static/03.jpg',
                  '/static/04.jpg',
                  '/static/05.jpg',
                  '/static/06.jpg'];

    var pix;

    init();



    function init() {
        var canvas = document.getElementById("myCanvas");
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
        var tempCanvas = document.getElementById("tempCanvas");

        canvas.onclick = function() {
            var src = images.shift();
            images.push(src);
            pix.loadNextImage(src, animate);
        }

        pix = new pixelator.Pixelator(canvas, tempCanvas);
        pix.loadImage(images[images.length - 1], function () { pix.drawPixels(); });
    }

    function animate() {
        pix.centredBomb(3, { x: 20 + Math.random() * 70, y: 20 + Math.random() * 70,
            width: 60, height: 60 });

        var animator = new animation.Animator();
        animator.addEvent(0, pix.animation);
        animator.start();
    }
});