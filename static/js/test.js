define(['jquery', 'pixelator', 'animation'], function ($, pixelator, animation) {
    var pix;

    var cursor = 1;
    var rect = undefined;

    init();

    function loadNextImage() {
        $.getJSON('/next_img', { cursor: cursor })
            .success(function (res) {
                pix.loadNextImage(res['src'], function() { animate(res['rect']); }, true);
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

        $.getJSON('/next_img')
            .success(function (res) {
                pix.loadImage(res['src'], function () { pix.drawPixels(); }, true);
                rect = res['rect'];
                cursor = res['cursor'];
                setTimeout(loadNextImage, 1000);
            });
    }

    function animate(newRect) {
        pix.centredBomb(3, rect);
        rect = newRect;

        var animator = new animation.Animator();
        animator.addEvent(0, pix.animation);
        animator.start();
    }
});