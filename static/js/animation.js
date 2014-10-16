window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function extend(Child, Parent) {
    var F = function() { }
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}


function Animator() {
    this._scale = [];
    this._cursor = new AnimationCursor();

    this.addEvent = function(time, drawFrame) {
        this._scale.push([time, drawFrame]);
    }

    this.start = function() {
        this._scale.sort(function (a, b) { return a[0] - b[0]} );
        this._startTime = (new Date()).getTime();
        this._animate();
    }


    this._animate = function() {
        var currentTime = (new Date()).getTime() - this._startTime;

        while (currentTime > this._scale[this._cursor.position][0]) {
            var drawFrame = this._scale[this._cursor.position][1];
            if (nextTime = drawFrame())
                this.addEvent(nextTime + currentTime, drawFrame);

            this._cursor.position++;
            if (this._cursor.position >= this._scale.length)
                break;
        }

        if (this._cursor.position < this._scale.length)
            requestAnimFrame(function(animation) {
                return function() { animation._animate(); }
            }(this));
        else
            console.log('Animation stopped');
    }
}


function AnimationCursor() {
    this.position = 0;
}



function opacityFrame(callback, start, stop, step) {
    var opacity = start;

    return function() {
        if (opacity > stop) {
            callback(opacity);
            opacity -= step;
            return 200;
        }
        else
            return false;
    }
}
