define({
    Pixelator: function(canvas) {
        function Pixel(x, y, r, g, b, a) {
            this.x = x;
            this.y = y;
            this.value = (a << 24) | (b << 16) | (g << 8) | r;

            this.speed = { x: 0, y: 0 }
            this.gravityCentre = { x: x, y: y}
            this.blackHoleDistance = 0;
            this.deltaDist = 0;
            this.stop = true;
            this.spaceLaw = true;

            this.push = function(speed, gravityCentre, blackHoleDistance, axelerationPower, spaceLaw) {
                this.speed = speed;
                this.gravityCentre = gravityCentre;
                this.blackHoleDistance = blackHoleDistance;
                this.axelerationPower = axelerationPower;
                this.deltaDist = 0;
                this.spaceLaw = spaceLaw;
                this.stop = false;
            }

            this.play = function(timeDelta) {
                if (this.stop)
                    return false;

                var gravityDX = this.x - this.gravityCentre.x;
                var gravityDY = this.y - this.gravityCentre.y;
                var curDist = gravityDX * gravityDX + gravityDY * gravityDY;

                this.x += this.speed.x * timeDelta;
                this.y += this.speed.y * timeDelta;

                gravityDX = this.x - this.gravityCentre.x;
                gravityDY = this.y - this.gravityCentre.y;
                var newDist = gravityDX * gravityDX + gravityDY * gravityDY;
                var speedDist = this.speed.x * this.speed.x + this.speed.y * this.speed.y;
                speedDist *= timeDelta * timeDelta;
                
                if (this.deltaDist < 0 && newDist - curDist > 0 &&
                    (Math.abs(newDist - curDist) <= speedDist || curDist < this.blackHoleDistance) ) {
                    this.x = this.gravityCentre.x;
                    this.y = this.gravityCentre.y;
                    this.stop = true;
                }

                this.deltaDist = newDist - curDist;

                gravityAngle = Math.atan2(gravityDY, gravityDX);
                var dist = gravityDX * gravityDX + gravityDY * gravityDY;
                var axeleration = timeDelta * this.axelerationPower / (this.spaceLaw ? Math.sqrt(dist) : 1);
                this.speed.x -= axeleration * Math.cos(gravityAngle);
                this.speed.y -= axeleration * Math.sin(gravityAngle);
            }
        }

        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.width = canvas.width;
        this.height = canvas.height;

        this.pixels = [];

        this.loadImage = function(img_src, callback) {
            this.image = new Image();
            this.image.onload = function(pixelator) { return function() { pixelator.init(callback); } }(this);
            this.image.src = img_src;
        }

        this.init = function(callback) {
            this.context.drawImage(this.image, 0, 0);
            var imageData = this.context.getImageData(0, 0, this.image.width, this.image.height);
            var data = imageData.data;

            this.marginX = (this.width - this.image.width) / 2;
            this.marginY = (this.height - this.image.height) / 2;

            for (var x = 0; x < this.image.width; x++)
                for (var y = 0; y < this.image.height; y++) {
                    var p = 4 * (y * this.image.width + x);
                    this.pixels.push(new Pixel(x, y,
                        data[p], data[p+1], data[p+2], data[p+3]));
                }

            this.context.clearRect(0, 0, this.width, this.height);

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
                var speed = 0.17 + Math.random() / 30;
                var angle = Math.atan2(dY, dX) + Math.random() * Math.PI / 70;
                var axelerationPower = 0.0067;
                var spaceLaw = true;

                if (pixel.x > stableRect.x && pixel.x < stableRect.x + stableRect.width &&
                    pixel.y > stableRect.y && pixel.y < stableRect.y + stableRect.height) {
                    speed = dist * 0.35 / Math.sqrt(dist * dist + 150*150) + Math.random() / 1000;
                    var angle = Math.atan2(dY, dX);// + Math.random() * Math.PI / 70;
                    axelerationPower = 1 / 25000 * dist / Math.sqrt(dist * dist + 70*70);
                    spaceLaw = false;
                }


                pixel.push({ x: speed * Math.cos(angle), y: speed * Math.sin(angle) },
                    { x: pixel.x, y: pixel.y }, this.image.width * 1.5, axelerationPower, spaceLaw);

                if (spaceLaw)
                    pixel.x += shift;
            }
        }

        this.play = function(timeDelta) {
            var toRemove = [];
            for (var i = 0; i < this.pixels.length; i++)
                this.pixels[i].play(100);
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
        this.startTime = undefined;
        this.animation = function(pixelator) {
            return function(globalTime) {
                if (pixelator.startTime === undefined)
                    pixelator.startTime = globalTime;
                if (pixelator.lastTime !== undefined)
                    pixelator.play(globalTime - pixelator.lastTime);
                    
                pixelator.drawPixels();
                pixelator.lastTime = globalTime;
                return globalTime - pixelator.startTime < 50000;
            }
        }(this);
    }
});