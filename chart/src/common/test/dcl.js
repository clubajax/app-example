requirejs.config({
    baseUrl: '../../',
    paths: {
        'common': './common',
        'dcl': './shared/dcl-master',
        'knockout': './shared/knockout',
        'localLib/on': './shared/on',
        'pubsub': './shared/pubsub',
        'has': './shared/has'
    }
});

require(['dcl/dcl', 'knockout', 'common/Base'], function(dcl, ko, Base) {

    var

        tester = ko.observable('init'),

        A = dcl(Base, {
            declaredClass:'A',
            foo:'bar',
            //text:'Sam',
            observables:{
                loaded:false,
                text:'Mike'
            },
            constructor: function(options){
                console.log('new A', options);
                console.log('tester', tester());

                // will continue to fire after dispose
                tester.subscribe(function(value){
                    console.log('unowned tester changed:', value);
                });

                // will cease firing after dispose:
                this.own(tester.subscribe(function(value){
                    console.log('owned tester changed:', value);
                }));
            },
            dispose: function(){
                console.log('A.dispose!');
            }
        }),

        a = new A({a:1,b:2, text:'Mitch'});
    

    tester('new value');


    a.dispose();

    tester('after dispose');

});
