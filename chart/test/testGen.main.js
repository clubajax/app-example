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
        'chart/main',

        'test/data/generator',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawing/DrawingCreator',
        'plugins/interaction/verticalZoom/verticalZoom',
        'common/ChartTypes',
        'plugins/superScroller/HorizontalScrollBar'
],function ($, main, generated, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, VerticalZoom, chartTypes, HorizontalScrollBar) {

    var $container = $('#chart'),
        broker = new Broker(),
        drawing,
        realTimeHandle,
        data = generated({
            bars:400,
            increment:'min'
        }),
        realtimeTime = 30,
        realtime = data.splice(Math.floor(data.length/2), data.length),
        history = data.splice(0, data.length);

    console.log('history', history);



    function addBar(bar){

        var axis = window.chart.graphs(0).axes(0),
                serie;

            if(axis){
                serie = axis.series(0);
                serie.data.add(bar);
            }
    }

    window.stopRealtime = function(){
        console.log('stop');
        clearInterval(realTimeHandle);
    };

    window.runRealtime = function(){
        realTimeHandle = setInterval(function(){

            addBar(realtime.shift());

            if(!realtime.length){
                clearInterval(realTimeHandle);
            }
        }, realtimeTime);
    };

    //setTimeout(window.runRealtime, 300);

    window.chart = new main.Chart($container, {
        resourceManager: resourceMananger,
        userInteractionType: main.userInteractionTypes.desktop,
        onEventCallback: function (eventType, eventObject) {
            return broker.onEventCallback(eventType, eventObject);
        },
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 40, // 60
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true
        },
        graphs: [
            {
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
                        data: history,
                        limits: {
                            time: {
                                minValueIndex: 40,
                                minValue: null,
                                maxValueIndex: 200,
                                maxValue: null
                            },
                            value: {
                                minValueIndex: null,
                                minValue: null,
                                maxValueIndex: null,
                                maxValue: null
                            }
                        },
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "area",
                                settings: {
                                    lineStyle:'purple'
                                },
                                dataPointDefinitions: [{
                                    key: 0,
                                    indication: true
                                }, {
                                    key: 1
                                }, {
                                    key: 2
                                }, {
                                    key: 3
                                }]
                            }
                        }]
                    }]
                }],
                header: {
                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Test Generated Data</span></div>",
                    onRectChanged: function (rect) {
                    },
                    height: 30
                }
            }
        ]
    });

    broker.setChart(window.chart);
    broker.add(new Selection());
    //broker.add(new Crosshair({ $domElement: $container }));
    broker.add(new VerticalZoom());
    broker.add(new Selection());

    window.scrollbar = new HorizontalScrollBar({
        broker:broker
    }, $container);
});

