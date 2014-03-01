requirejs.config({
    baseUrl: '../../../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'lib': './src/lib',
        'i18n': './src/lib/i18n',
        'test': './test',

        'pubsub': './src/shared/pubsub',
        'localLib/on': './src/shared/on',
        'localLib/mouse': './src/shared/mouse',
        'localLib/logger': './src/shared/logger',
        'has': './src/shared/has',
        'EventEmitter': './src/shared/EventEmitter',
        'dcl': './src/shared/dcl-master',
        'jquery':'./src/shared/jquery-latest'
    }
});
console.log('TEST ON LIB');
require([
    'localLib/on'
], function(on) {

    console.log('on loaded');
    var h1, h2, o;


    on('css', 'click .tab a', function(e){
        console.log('clicked tab');
    });




    h1 = on('b1', 'click', function(){
        console.log('clicker');
    });
    on('b2', 'click', function(){
        h1.pause();
        console.log('pause!');
    });
    on('b3', 'click', function(){
        h1.resume();
        console.log('resume!');
    });
    on('b4', 'click', function(){
        h1.remove();
        console.log('remove!');
    });

    h2 = on.multi('m1', {
        'click': function(){ console.log('multi click'); },
        'mousedown': function(){ console.log('multi down'); },
        'mouseup': function(){ console.log('multi up'); }
    });

    on('m2', 'click', function(){
        h2.pause();
        console.log('pause multi!');
    });
    on('m3', 'click', function(){
        h2.resume();
        console.log('resume multi!');
    });
    on('m4', 'click', function(){
        h2.remove();
        console.log('remove mutli!');
    });




    o = {
        init: function(){
            on('cb1', 'click', 'onClick', this);
            on.multi('cm1', {
                'click': 'onClick',
                'mousedown': 'onDown',
                'mouseup': 'onUp'
            }, this);
        },
        onClick: function(evt){
            console.log('context click',  evt);
        },
        onDown: function(evt){
            console.log('context down',  evt);
        },
        onUp: function(evt){
            console.log('context up',  evt);
        }
    };

    o.init();


});
