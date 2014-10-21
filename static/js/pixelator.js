define(['pixel'], function (pixel) {
    return {
        Pixelator: function(canvas, tempCanvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');

            this.tempCanvas = tempCanvas;
            this.tempContext = tempCanvas.getContext('2d');

            this.width = canvas.width;
            this.height = canvas.height;

            this.pixels = [];

            this.loadImage = function(img_src, callback) {
                this.image = new Image();
                this.image.onload = function(pixelator) { return function() { pixelator.init(callback); } }(this);
                this.image.src = img_src;
            }

            this.loadNextImage = function(img_src, callback) {
                var nextImage = new Image();
                nextImage.onload = function(pixelator) { return function() { pixelator.setNextImage(this, callback); } }(this);
                nextImage.src = img_src;
            }

            this.init = function(callback) {
                this.tempContext.drawImage(this.image, 0, 0);
                var imageData = this.tempContext.getImageData(0, 0, this.image.width, this.image.height);
                var data = imageData.data;

                this.marginX = (this.width - this.image.width) / 2;
                this.marginY = (this.height - this.image.height) / 2;

                for (var x = 0; x < this.image.width; x++)
                    for (var y = 0; y < this.image.height; y++) {
                        var p = 4 * (y * this.image.width + x);
                        this.pixels.push(new pixel.Pixel(x, y,
                            data[p], data[p+1], data[p+2], data[p+3]));
                    }

                callback();
            }

            this.setNextImage = function(nextImage, callback) {
                this.tempContext.drawImage(nextImage, 0, 0);

                var imageData = this.tempContext.getImageData(0, 0, this.image.width, this.image.height);
                var data = imageData.data;

                for (var i = 0; i < this.pixels.length; i++) {
                    var pixel = this.pixels[i];
                    if (pixel.x >= 0 && pixel.x < nextImage.width &&
                        pixel.y >= 0 && pixel.y < nextImage.height) {
                        var p = 4 * (pixel.y * nextImage.width + pixel.x);
                        pixel.setNextColor(data[p], data[p+1], data[p+2], data[p+3]);
                    }
                }

                callback();
            }

            this.randomBomb = function(maxSpeed) {
                for (var i = 0; i < this.pixels.length; i++) {
                    var speed = Math.random() * maxSpeed;
                    var angle = Math.random() * 2 * Math.PI;
                    this.pixels[i].speed = {
                        x: speed * Math.sin(angle),
                        y: speed * Math.cos(angle)
                    }
                }
            }

            this.centredBomb = function(maxShift, stableRect) {
                var xCentre = this.image.width / 2;
                var yCentre = this.image.height / 2;
                var shift = 2 * Math.random() * maxShift - maxShift;
                for (var i = 0; i < this.pixels.length; i++) {
                    var pixel = this.pixels[i];
                    var dX = pixel.x - xCentre;
                    var dY = pixel.y - yCentre;
                    var dist = Math.sqrt(dX * dX + dY * dY);
                    var speed = 0.35 + Math.random() / 4;
                    var angle = Math.atan2(dY, dX) + Math.random() * Math.PI / 70;
                    var axelerationPower = 0.0005;//0.143;

                    if (pixel.x > stableRect.x && pixel.x < stableRect.x + stableRect.width &&
                        pixel.y > stableRect.y && pixel.y < stableRect.y + stableRect.height) {
                        speed = dist * 1.75 / Math.sqrt(dist * dist + 150*150) + Math.random() / 1000;
                        var angle = Math.atan2(dY, dX);// + Math.random() * Math.PI / 70;
                        axelerationPower = 1 / 1000 * dist / Math.sqrt(dist * dist + 70*70);
                        if (axelerationPower == 0)
                            axelerationPower = 0.1;
                    }


                    pixel.push({ x: speed * Math.cos(angle), y: speed * Math.sin(angle) },
                        { x: pixel.x, y: pixel.y }, this.image.width * 1.5, axelerationPower);

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
                    if (pixel.x + this.marginX >= 0 && pixel.y + this.marginY >= 0 &&
                        pixel.x + this.marginX < this.width && pixel.y + this.marginY < this.height)
                        data[parseInt(pixel.y + this.marginY) * this.width + parseInt(pixel.x + this.marginX)] = pixel.value;
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