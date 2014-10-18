function Pixelator(canvas) {
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
        var imageData = this.context.getImageData(0, 0, this.width, this.height);
        var data = imageData.data;

        for (var x = 0; x < this.width; x++)
            for (var y = 0; y < this.height; y++) {
                var p = 4 * (y * this.width + x);
                this.pixels.push(new Pixel(x, y, data[p], data[p+1], data[p+2], data[p+3]));
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

    this.randomBomb = function() {
        var xCentre = this.width / 2;
        var yCentre = this.height / 2;
        for (var i = 0; i < this.pixels.length; i++) {
            var pixel = this.pixels[i];
            var dX = pixel.x - xCentre;
            var dY = pixel.y - yCentre;
            var dist = Math.sqrt(dX * dX + dY * dY);
            var speed = dist < 320 ? (320 - dist) / 5000 + 0.05 : 0.05;
            speed /= 10;
            var angle = Math.atan2(dY, dX);
            this.pixels[i].speed = {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle)
            }
        }
    }

    this.play = function(timeDelta) {
        console.log(timeDelta);
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
            if (pixel.x >= 0 && pixel.y >= 0 && pixel.x < this.width && pixel.y < this.height)
                data[parseInt(pixel.y) * this.width + parseInt(pixel.x)] = pixel.value;
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
            return globalTime - pixelator.startTime < 20000;
        }
    }(this);
}

function Pixel(x, y, r, g, b, a) {
    this.x = x;
    this.y = y;
    this.value = (a << 24) | (b << 16) | (g << 8) | r;

    this.speed = { x: 0, y: 0 };

    this.play = function(timeDelta) {
        this.x += this.speed.x * timeDelta;
        this.y += this.speed.y * timeDelta;
    }
}