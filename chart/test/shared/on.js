requirejs.config({
    baseUrl: '../../',
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

require([
    'localLib/on'
], function(on) {

    console.log('on loaded');
    var h1, h2, o, SID = 'single', MID = 'multi', CID = 'ctx';

    h1 = on('b1', 'click', function(){
        console.log('click!');
    }, SID);
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
    }, MID);

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

    on('i1', 'click', function(){
        on.remove(SID);
        console.log('removed single by id');
    });
    on('i2', 'click', function(){
        on.remove(MID);
        console.log('removed multi by id');
    });
    on('i3', 'click', function(){
        on.remove(CID);
        console.log('removed context by id');
    });

    o = {
        init: function(){
            on('b1', 'click', 'onClick', this, SID);
            on.multi('m1', {
                'click': 'onClick',
                'mousedown': 'onDown',
                'mouseup': 'onUp'
            }, this, CID);
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
