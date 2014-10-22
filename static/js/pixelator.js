define(['pixel'], function (pixel) {
    return {
        Pixelator: function(canvas, tempCanvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');

            this.tempCanvas = tempCanvas;
            this.tempContext = tempCanvas.getContext('2d');

            this.pixels = [];

            this.loadImage = function(img_src, callback) {
                image = new Image();
                image.onload = function(pixelator) { return function() { pixelator.init(image, callback); } }(this);
                image.src = img_src;
            }

            this.loadNextImage = function(img_src, callback) {
                var nextImage = new Image();
                nextImage.onload = function(pixelator) { return function() { pixelator.setNextImage(nextImage, callback); } }(this);
                nextImage.src = img_src;
            }

            this.init = function(image, callback) {
                this.tempContext.drawImage(image, 0, 0);
                var imageData = this.tempContext.getImageData(0, 0, image.width, image.height);
                var data = imageData.data;

                this.marginX = (this.canvas.width - image.width) / 2;
                this.marginY = (this.canvas.height - image.height) / 2;

                for (var x = 0; x < image.width; x++)
                    for (var y = 0; y < image.height; y++) {
                        var p = 4 * (y * image.width + x);
                        this.pixels.push(new pixel.Pixel(x, y,
                            data[p], data[p+1], data[p+2], data[p+3]));
                    }

                this.imageSize = { width: image.width, height: image.height };

                callback();
            }

            this.setNextImage = function(nextImage, callback) {
                this.tempContext.drawImage(nextImage, 0, 0);

                var imageData = this.tempContext.getImageData(0, 0, nextImage.width, nextImage.height);
                var data = imageData.data;

                for (var i = 0; i < this.pixels.length; i++) {
                    var pixel = this.pixels[i];
                    if (pixel.position.x >= 0 && pixel.position.x < nextImage.width &&
                        pixel.position.y >= 0 && pixel.position.y < nextImage.height) {
                        var p = 4 * (pixel.position.y * nextImage.width + pixel.position.x);
                        pixel.setNextColor(data[p], data[p+1], data[p+2], data[p+3]);
                    }
                }

                callback();
            }

            this.centredBomb = function(maxShift, stableRect) {
                var shift = 2 * Math.random() * maxShift - maxShift;
                for (var i = 0; i < this.pixels.length; i++) {
                    var pixel = this.pixels[i],
                        dX = pixel.position.x - this.imageSize.width / 2,
                        dY = pixel.position.y - this.imageSize.height / 2,
                        dist = Math.sqrt(dX * dX + dY * dY);

                    var speed, angle, axelerationPower;

                    if (pixel.position.x > stableRect.x && pixel.position.x < stableRect.x + stableRect.width &&
                        pixel.position.y > stableRect.y && pixel.position.y < stableRect.y + stableRect.height) {
                        speed = dist * 1.75 / Math.sqrt(dist * dist + 150*150) + Math.random() / 1000;
                        var angle = Math.atan2(dY, dX);// + Math.random() * Math.PI / 70;
                        axelerationPower = 0.001 * dist / Math.sqrt(dist * dist + 70 * 70);
                        if (axelerationPower == 0) axelerationPower = 0.1;
                    }
                    else {
                        speed = 0.35 + Math.random() / 4;
                        angle = Math.atan2(dY, dX) + Math.random() * Math.PI / 70;
                        axelerationPower = 0.0005;
                    }


                    pixel.push({ x: speed * Math.cos(angle), y: speed * Math.sin(angle) },
                        { x: pixel.position.x, y: pixel.position.y }, this.imageSize.width * 1, axelerationPower);

                }
            }

            this.play = function(timeDelta) {
                var result = false;
                for (var i = 0; i < this.pixels.length; i++)
                    result = this.pixels[i].play(timeDelta) || result;
                return result;
            }

            this.drawPixels = function() {
                var imageData = this.context.createImageData(canvas.width, canvas.height);
                var buf = new ArrayBuffer(imageData.data.length);
                var buf8 = new Uint8ClampedArray(buf);
                var data = new Uint32Array(buf);

                for (var i = 0; i < this.pixels.length; i++) {
                    var pixel = this.pixels[i];
                    if (pixel.position.x + this.marginX >= 0 && pixel.position.y + this.marginY >= 0 &&
                        pixel.position.x + this.marginX < this.canvas.width && pixel.position.y + this.marginY < this.canvas.height) {
                        data[parseInt(pixel.position.y + this.marginY) * this.canvas.width + parseInt(pixel.position.x + this.marginX)] = pixel.color;
                    }
                }

                imageData.data.set(buf8);
                this.context.putImageData(imageData, 0, 0);
            }


            this.lastTime = undefined;
            this.animation = function(pixelator) {
                return function(globalTime) {
                    var goAhead = true;
                    if (pixelator.lastTime !== undefined)
                        goAhead = pixelator.play(globalTime - pixelator.lastTime);
                        
                    pixelator.drawPixels();
                    pixelator.lastTime = globalTime;
                    if (!goAhead)
                        pixelator.lastTime = undefined;
                    return goAhead;
                }
            }(this);
        }
    }
});