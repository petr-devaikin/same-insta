define(['jquery', 'pixelator', 'animation'], function ($, pixelator, animation) {
    var pix;

    var cursor = 1;

    init();

    function loadNextImage() {
        $.getJSON('/next_img', { cursor: cursor })
            .success(function (res) {
                pix.loadNextImage(res['src'], animate);
                cursor = res['cursor'];
                setTimeout(loadNextImage, 3000);
            });
    }

    function init() {
        var canvas = document.getElementById("myCanvas");
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
        var tempCanvas = document.getElementById("tempCanvas");

        pix = new pixelator.Pixelator(canvas, tempCanvas);

        $.getJSON('/next_img', { cursor: cursor })
            .success(function (res) {
                pix.loadImage(res['src'], function () { pix.drawPixels(); });
                cursor = res['cursor'];
                setTimeout(loadNextImage, 1000);
            });
    }

    function animate() {
        pix.centredBomb(3, { x: 20 + Math.random() * 70, y: 20 + Math.random() * 70,
            width: 60, height: 60 });

        var animator = new animation.Animator();
        animator.addEvent(0, pix.animation);
        animator.start();
    }
});