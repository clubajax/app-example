requirejs.config({
    baseUrl: '../../../',
    paths: {
        'jquery':    './lib/jquery',
        'chart':    './chart',
        'plugins':  './src/plugins',
        'common':   './src/common',
        'i18n':     './lib/i18n',
        'knockout': './lib/knockout'
    }
});

require([
    // load dependencies here
    //'common/observable' <--- called a MID or module ID
], function(/*observable*/) { //  modules loade and returned through these args

    // private functions here!

    // make a module here!

    // return something! Usually your module

});
