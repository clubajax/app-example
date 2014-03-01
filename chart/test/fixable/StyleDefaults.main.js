requirejs.config({
    baseUrl: '../',
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
        'localLib/Evented': './src/shared/Evented',
        'has': './src/shared/has',
        'EventEmitter': './src/shared/EventEmitter',
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
    'plugins/interaction/drawingObjectCreation/drawingObjectCreator',
    'plugins/interaction/datatip/Datatip'
], function ($, bardata, timestamped, main, seriePainterFactory, resourceMananger, Broker, userInteractionTypes, utilities, chartTypes,
             Crosshair, Selection, GraphResizing, HorizontalZoom, horizontalZoom, HorizontalScrollBar, DrawingObjectCreator, Datatip) {

    var $container = $('#parent'),
        broker = new Broker();

    broker.pluginsStack.push(new Selection());
    broker.pluginsStack.push(new Crosshair());

    window.chart = new main.Chart($container, {
        theme:'dark',
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
                            //name: "candlestick",
                            name:'ohlc',
                            settings: {
                                lineStyle:'stopgo'
                            },
                            dataPointDefinitions: [{key: 0}, {key: 1, indication: true}, {key: 2}, {key: 3}]
                        }
                    },
                    {
                        // top line
                        isSelected: 1,
                        chartType: {
                            name: "line",
                            settings: {
                                lineStyle:'red',
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
                                lineStyle:'green'
                            },
                            dataPointDefinitions: [{
                                key: 2,
                                indication: true
                            }]
                        }
                    },
                    {
                        // middle line
                        isSelected: 0,
                        chartType: {
                            name: "line",
                            settings: {
                                lineStyle:'purple',
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
                domElement: "<div style='height:100%;width:100%; text-align:center;font-size: 30px;background-color: #303030;'><span style='color: white; font-family:Verdana;font-size:15px;'>Style Defaults Check</span></div>",
                onRectChanged: function (rect) {
                },
                height: 30
            }
        }]
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
