requirejs.config({
    baseUrl: 'static/js',
    urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['test']);