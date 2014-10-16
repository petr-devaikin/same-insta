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


var Animation = function() {
    this._scale = [];
    this._cursor = new AnimationCursor();

    this.addEvent = function(time, callback) {
        this._scale.push([time, callback]);
    }

    this.start = function() {
        this._scale.sort(function (a, b) { return a[0] - b[0]} );
        this._startTime = (new Date()).getTime();
        this._animate();
    }


    this._animate = function() {
        var currentTime = (new Date()).getTime() - this._startTime;

        while (currentTime > this._scale[this._cursor.position][0]) {
            this._scale[this._cursor.position][1]();
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


var AnimationCursor = function() {
    this.position = 0;
}