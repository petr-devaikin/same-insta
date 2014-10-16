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


function Animator() {
    this._events = [];
    this._live;

    this.addEvent = function(time, animation) {
        var i = 0;
        while (i < this._events.length && this._events[i].time < time)
            i++;
        this._events.splice(i, 0, { time: time, animation: animation });
    }

    this.start = function() {
        this._startTime = (new Date()).getTime();
        this._live = [];
        this._animate();
    }


    this._animate = function() {
        var currentTime = (new Date()).getTime() - this._startTime;

        while (this._events.length && currentTime > this._events[0].time) {
            var e = this._events.shift();
            e.animation(e.time);
            this._live.push(e.animation);
        }

        var toRemove = [];
        for (var a in this._live) {
            if (!this._live[a](currentTime))
                toRemove.push(a)
        }

        for (var i in toRemove)
            this._live.splice([toRemove[i]], 1);

        if (this._live.length || this._events.length)
            requestAnimFrame(function(animator) {
                return function() { animator._animate(); }
            }(this));
        else
            console.log('Animation stopped');
    }
}



function linealAnimation(callback, start, stop, period) {
    var value = start,
        startTime = undefined;

    return function(globalTime) {
        if (startTime == undefined)
            startTime = globalTime;

        value = start + (globalTime - startTime) * (stop - start) / period;
        if ((stop - start) * (stop - value) < 0)
            value = stop;

        callback(value);

        return value != stop;
    }
}
