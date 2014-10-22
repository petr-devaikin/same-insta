define({
    Pixel: function(x, y, r, g, b, a) {
        this.position = { x: x, y: y };
        this.color = (a << 24) | (b << 16) | (g << 8) | r;

        this.speed = { x: 0, y: 0 };
        this.gravityCentre = { x: x, y: y}
        this.blackHoleDistance = 0;
        this.deltaDist = 0;
        this.stop = true;

        this.setNextColor = function(r, g, b) {
            this.nextValue = (a << 24) | (b << 16) | (g << 8) | r;
        }

        this.push = function(speed, gravityCentre, blackHoleDistance, axelerationPower) {
            this.speed = speed;
            this.gravityCentre = gravityCentre;
            this.blackHoleDistance = blackHoleDistance;
            this.axelerationPower = axelerationPower;
            this.deltaDist = 0;
            this.stop = false;
            this.startValue = undefined;
            this.maxColorDist = undefined;
        }

        this.play = function(timeDelta) {
            if (this.stop)
                return false;

            var gravityDX = this.position.x - this.gravityCentre.x;
            var gravityDY = this.position.y - this.gravityCentre.y;
            var curDist = Math.sqrt(gravityDX * gravityDX + gravityDY * gravityDY);

            this.position.x += this.speed.x * timeDelta;
            this.position.y += this.speed.y * timeDelta;

            gravityDX = this.position.x - this.gravityCentre.x;
            gravityDY = this.position.y - this.gravityCentre.y;
            var newDist = Math.sqrt(gravityDX * gravityDX + gravityDY * gravityDY);
            var speedDist = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
            speedDist *= timeDelta;


            if (this.maxColorDist !== undefined) {
                var k = newDist / this.maxColorDist;
                this.color = this.startValue & 0xFF000000 |
                    ((this.startValue & 0xFF) * k + (this.nextValue & 0xFF) * (1 - k)) |
                    ((((this.startValue & 0xFF00) >> 8) * k + ((this.nextValue & 0xFF00) >> 8) * (1 - k)) << 8) |
                    ((((this.startValue & 0xFF0000) >> 16) * k + ((this.nextValue & 0xFF0000) >> 16) * (1 - k)) << 16);
            }
            
            if (this.deltaDist < 0 && newDist - curDist >= 0 &&
                (Math.abs(newDist - curDist) <= speedDist || curDist < this.blackHoleDistance) ) {
                this.position.x = this.gravityCentre.x;
                this.position.y = this.gravityCentre.y;
                this.stop = true;
                if (this.nextValue !== undefined)
                    this.color = this.nextValue;
            }
            else if (this.deltaDist > 0 && newDist - curDist <= 0) {
                this.startValue = this.color;
                this.maxColorDist = newDist;
            }

            this.deltaDist = newDist - curDist;

            gravityAngle = Math.atan2(gravityDY, gravityDX);
            var dist = gravityDX * gravityDX + gravityDY * gravityDY;
            var axeleration = timeDelta * this.axelerationPower;
            this.speed.x -= axeleration * Math.cos(gravityAngle);
            this.speed.y -= axeleration * Math.sin(gravityAngle);

            return !this.stop;
        }
    }
});