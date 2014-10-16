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


var Animator = function() {
    this._scale = [];
    this._cursor = new AnimationCursor();

    this.addEvent = function(time, fragment) {
        this._scale.push([time, fragment]);
    }

    this.start = function() {
        this._scale.sort(function (a, b) { return a[0] - b[0]} );
        this._startTime = (new Date()).getTime();
        this._animate();
    }


    this._animate = function() {
        var currentTime = (new Date()).getTime() - this._startTime;

        while (currentTime > this._scale[this._cursor.position][0]) {
            console.log(this._scale[this._cursor.position][1]);
            this._scale[this._cursor.position][1].perform(this, currentTime);
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


var AnimationFragment = function() {
    this._nextTime = undefined;
    this._doAction = function(globalTime) { }

    this.perform = function(animator, globalTime) {
        this._doAction(globalTime);
        if (this._nextTime) {
            console.log('added');
            animator.addEvent(this._nextTime, this)
        }
    }
}


var OpacityFragment = function(callback, start, stop, step) {
    this._opacity = start;

    this._doAction = function(globalTime) {
        if (this._opacity > stop) {
            callback(this._opacity);
            this._nextTime = globalTime + 200;
            this._opacity -= step;
        }
        else
            this._nextTime = undefined;
    }
}
OpacityFragment.prototype = new AnimationFragment();
