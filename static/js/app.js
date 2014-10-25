requirejs.config({
    baseUrl: 'static/js',
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: { jquery: 'jquery-2.1.1.min' }
});

requirejs(['test']);