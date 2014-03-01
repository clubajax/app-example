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
    'common/observable'
], function(observable) {

    var timer, likes, pie, o;

    timer = function(obs, val, callback){
        setTimeout(function(){
            obs(val);
            if(callback){
                callback();
            }
        }, 300);
    };

    pie = observable();
    pie.modify(function(v){
        if(v === 1){
            return v + ' pie';
        }
        if(v > 9){
            return 'A LOT OF PIE';
        }
        return v + ' pies';
    });
    pie.subscribe(function(v){
        console.log('I eat', v);
    });
    pie(1);
    pie(2);
    pie(10);
    console.log('How much pie? ', pie());
    
    o = {
        init: function(){
           // var
           var snack = observable();
           snack.subscribe(this.onValue, this);
           snack('munch');
        },
        onValue: function(v){
            console.log('contextual value: ', v);
        }
    };
    o.init();

    // TODO
    // Test Array methods

    //async
    likes = observable();
    likes.subscribe(function(v){
        console.log('likes: ', v);
    });
    timer(likes, 'nothing', function(){
        timer(likes, 'pie');
    });



});
