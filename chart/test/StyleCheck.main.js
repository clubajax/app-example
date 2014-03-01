requirejs.config({
    baseUrl: '../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'lib': './src/lib',
        'i18n': './src/lib/i18n',
        'test': './test',

        'knockout': './src/shared/knockout',
        'pubsub': './src/shared/pubsub',
        'localLib/on': './src/shared/on',
        'localLib/mouse': './src/shared/mouse',
        'localLib/logger': './src/shared/logger',
        'has': './src/shared/has',
        'EventEmitter': './src/shared/EventEmitter',
        'localLib/Evented': './src/shared/Evented',
        'dcl': './src/shared/dcl-master',
        'jquery':'./src/shared/jquery-latest'
    }
});

require([
    'jquery',
    'test/data/barData-2',
    'test/data/timestamped',
    'chart/main',
    'chart/SeriePainters/SeriePainterFactory',
    'plugins/resourceManager/ResourceManager',
    'plugins/interaction/Broker/Broker',
    'common/userInteractionTypes',
    'common/utilities',
    'common/ChartTypes',

    'plugins/interaction/crosshair/crosshair',
    'plugins/interaction/selection/selection',
    'plugins/interaction/graphResizing/graphResizing',
    'plugins/interaction/horizontalZoom/horizontalZoom',
    'plugins/superScroller/HorizontalScrollBar',
    "plugins/interaction/drawing/DrawingCreator",
    'plugins/interaction/datatip/Datatip'
], function ($, bardata, timestamped, main, seriePainterFactory, resourceMananger, Broker, userInteractionTypes, utilities, chartTypes,
             Crosshair, Selection, GraphResizing, HorizontalZoom, HorizontalScrollBar, DrawingCreator, Datatip) {

    var $container = $('#parent'),
        broker = new Broker();

    broker.add(new Selection());
    broker.add(new Crosshair());

    window.chart = new main.Chart($container, {
        painterFactory: seriePainterFactory,
        resourceManager: resourceMananger,
        userInteractionType: userInteractionTypes.desktop,
        onEventCallback: function (eventType, eventObject) {
            return broker.onEventCallback(eventType, eventObject);
        },
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 20,
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true
        },
        graphs: [{
            realEstatePercentage: 1,
            axes: [{
                position: 'right',
                showHorizontalLines: true,
                showLabels: true,
                limits: 'auto',
                scalingType: 'linear',
                minMove: 0.01,
                numberFormat: 3,
                series: [{
                    data: timestamped,

                    layers: [{
                        isSelected: false,
                        chartType: {
                            name: "ohlc",
                            settings: {
                                draw: {
                                    colorBear: '255, 0, 0',
                                    colorBull: '0, 255, 0',
                                    color: '0, 255, 0',
                                    width: 0.5      // (px)
                                },
                                selection: {
                                    squareSide: 8,
                                    color: '255, 255, 255',
                                    width: 0.5
                                },
                                indication: {
                                    fontColor: '0,0,0'
                                }
                            },
                            dataPointDefinitions: [{
                                key: 0
                            }, {
                                key: 1
                            }, {
                                key: 2
                            }, {
                                key: 3,
                                indication: true
                            }]
                        }
                    },
                    {
                        // top line
                        isSelected: 1,
                        chartType: {
                            name: "line",
                            settings: {
                                draw: {
                                    color: '255, 255, 255',
                                    width: 0.5      // (px)
                                },
                                selection: {
                                    squareSide: 8,
                                    color: '255, 255, 255',
                                    width: 0.5
                                },
                                indication: {
                                    fontColor: '0,0,0'
                                }
                            },
                            dataPointDefinitions: [{
                                key: 1
                            }]
                        }
                    },
                    {
                        // bottom line
                        isSelected: false,
                        chartType: {
                            name: "area",
                            settings: {
                                draw:{
                                    color: '255, 255, 0',
                                    width: 1,      // (px)
                                    gradient: [{ alpha: '0.95', offset: '0' }, { alpha: '0.05', offset: '1' }]
                                },
                                selection: {
                                    squareSide: 8,
                                    color: '255, 255, 255',
                                    width: 0.5
                                },
                                indication: {
                                    fontColor: '0,0,0'
                                }
                            },
                            dataPointDefinitions: [{
                                key: 2
                            }]
                        }
                    },
                    {
                        // middle line
                        isSelected: 0,
                        chartType: {
                            name: "line",
                            settings: {
                                draw: {
                                    color: '255, 0, 255',
                                    width: 0.5
                                },
                                selection: {
                                    squareSide: 8,
                                    color: '255, 255, 255',
                                    width: 0.5
                                },
                                indication: {
                                    fontColor: '255, 255, 255'
                                }
                            },
                            dataPointDefinitions: [{
                                key: 3,
                                indication: true
                            }]
                        }
                    }]
                }]
            }],
            header: {
                //domElement: "<div style='height:100%;width:100%; text-align:center;font-size: 30px;background-color: #303030;'><span style='color: white; font-family:Verdana;font-size:15px;'>Style Check</span></div>",
                onRectChanged: function (rect) {
                },
                height: 30
            }
        }],
        style: {

            axes: {
                color: 'rgba(255, 0, 0,1)',
                width: 1
            },
            label: {
                color: 'rgba(255, 30, 30, 1)',
                font: 'normal 11px Verdana'
            },
            grid: {
                intraDayColor: 'rgba(255, 0, 0, 0)',
                horizontalColor: 'rgba(255, 0, 0, 0)',
                noIntraDayColor: 'rgba(255, 0, 0, 0)',
                width: 1
            },
            crosshair: {
                draw: {
                    color: 'rgba(255,125,139, 0.2)',
                    width: 1
                },
                indication: {
                    color: 'rgba(255, 255, 255, 1)',
                    font: 'normal 11px Verdana'
                }
            }
        }
    });


    window.superScroller = new HorizontalScrollBar($container, {
        totalRange: {
            minValue: 0,
            maxValue: 330
        },
        activeRange: {
            minValue: 30,
            maxValue: 300
        },
        leftHandleMarging: 20,
        rightHandleMarging: 20,
        onBeginRangeChangeCallback: function() {
            console.info('beginRangeChange');
        },
        onRangeChangeCallback: function(range) {
            console.info('rangeChange, minValue: ' + range.minValue + ', maxValue: ' + range.maxValue);
        },
        onEndRangeChangeCallback: function() {
            console.info('endRangeChange');
        }
    });


});


function testMix(){
    function isArray(item){
        return Object.prototype.toString.call( item ) === '[object Array]';
    }

    var mixin = function(){
        var
            args = Array.prototype.slice.call(arguments),
            i, m, o,
            isDeep = args[0] === true;

        if(isDeep){
            args.shift();
        }

        o = args[0];
        if ( typeof o !== "object" && typeof o !== 'function' ) {
            o = {};
        }

        console.log('ARGS', args);

        function mix(o1, o2){
            var k;
            if(isArray(o2)){
                console.log('   array');
                for(k = 0; k < o2.length; k++){
                    if(isDeep && typeof o2[k] === 'object'){
                        console.log('    deep array');
                        if(!o1[k]){
                            o1[k] = isArray(o2[k]) ? [] : {};
                        }
                        mix(o1[k], o2[k]);
                    }else{
                        console.log('   copy', o1[k], o2[k]);
                        o1[k] = o2[k];
                    }
                }
            }else{
                for(k in o2){
                    if(o2.hasOwnProperty(k)){
                        if(isDeep && typeof o2[k] === 'object'){
                            if(!o1[k]){
                                o1[k] = isArray(o2[k]) ? [] : {};
                            }
                            mix(o1[k], o2[k]);
                        }else{
                            console.log(' wut', o1, o2);
                            o1[k] = o2[k];
                        }
                    }
                }
            }
        }
        for(i = 1; i < args.length; i++){
            m = args[i];
            mix(o, m);
        }
        return o;
    };


    //var a = {a:1, b:2, ar:[0,1,2]};
    //var b = {name:'mike', ar:[3,4,5], props:{age:21}};
    //var o = mixin(true, a,b);
    //console.log('MIXIN', o);
    //b.props.age = 99;
    //console.log('changed', o);



    function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && typeof target !== 'function' ) {
            target = {};
        }

        function notNull(item){
            return item !== null && item !== undefined;
        }

        function isObject(item){
            return typeof item === 'object' && !(item instanceof window.Node);
        }

        function isArray(item){
            return Object.prototype.toString.call( item ) === '[object Array]';
        }

        for ( ; i < length; i++ ) {
            options = arguments[ i ];
            // Only deal with non-null/undefined values
            if ( notNull(options) ) {
                // Extend the base object
                for ( name in options ) {
                    if(options.hasOwnProperty(name)){
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( isObject(copy) || (copyIsArray = isArray(copy)))) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];

                            } else {
                                clone = src && isObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = extend( deep, clone, copy );

                        // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }


    console.log('--------EXTEND');
    var a = {a:11, b:22, ar:[{x:1},1,2]};
    var b = {name:'mike', ar:[{y:2}, null, null, 3,4,5], props:{age:18}};
    var o = extend(true, a,b);
    console.log('EXTEND', o);
    b.props.age = 99;
    console.log('changed', o);
}
