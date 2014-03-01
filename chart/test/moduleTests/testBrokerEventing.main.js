requirejs.config({
    baseUrl: '../../../../../',
    paths: {
        //'chart': './src/chart',
        //'plugins': './src/plugins',
        //'common': './src/common',
        //'i18n': './lib/i18n'
    }
});


require([
        "./lib/domReady",
        "./lib/jquery"
       
], function (domReady) {



    domReady(function () {

        var element = document.getElementById('parent');

        element.onmousemove = function(eventObject) {
            console.log('chartRendererHelper: mousemove, x: ' + eventObject.pageX + ', y: ' + eventObject.pageY);
        };

        //var $container = $('#parent');

        //$container.on({
        //    mousedown: function (eventObject) {
        //        eventObject.preventDefault();

        //        eventObject.preventDefault();

        //        console.log('chartRendererHelper: mousedown');
        //    },
        //    mousemove: function (eventObject) {

        //        eventObject.preventDefault();

        //        console.log('chartRendererHelper: mousemove, x: ' + eventObject.pageX + ', y: ' + eventObject.pageY);
        //    },
        //    mouseup: function (eventObject) {
        //        eventObject.preventDefault();

        //        console.log('chartRendererHelper: mouseup');
        //    },
        //});

    });

});