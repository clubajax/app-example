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
        'chart/main',

        'test/data/timestamped',
        'test/data/series',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawing/DrawingCreator',
        'plugins/interaction/horizontalZoom/horizontalZoom',
        'plugins/interaction/verticalZoom/verticalZoom',

        "common/ChartTypes",

        'lib/jquery'
],function (main, data, seriesData, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, HorizontalZoom, VerticalZoom, chartTypes) {

    var $container = $('#chart'),
        broker = new Broker(),
        drawing;

    broker.add(new Selection());

    //broker.add(new Crosshair({ $domElement: $container }));
    broker.add(new HorizontalZoom());
    broker.add(new VerticalZoom());

    drawing = new DrawingCreator({
        $domElement: $container,
        broker:broker,
        defaultAxisIndex: 0,
        isActive: false,
        isPersistent: false,
        drawingTemplate: null
    });
    broker.add(drawing);
    broker.add(new Selection());

    window.chart = new main.Chart($container, {
        resourceManager: resourceMananger,
        userInteractionType: main.userInteractionTypes.desktop,
        onEventCallback: function (eventType, eventObject) {
            return broker.onEventCallback(eventType, eventObject);
        },
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 100,
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true
        },
        graphs: [
            //#region subgraph 1
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
                        data: data,
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
                                name: "candlestick",
                                settings: {
                                    lineStyle:'hotcold'
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
                        }]
                    },{
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), price: null } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    lineStyle:'blue'
                                }
                            }
                        }]
                    },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: null, price: 13.53 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    lineStyle:'purple',
                                    style:{
                                        lineStyle:'red'
                                    }
                                }
                            }
                        }]
                    },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 2, 4, 9, 37, 0, 0), price: 14.70 } },
                                 { name: 'point2', value: { timeStamp: new Date(2012, 2, 30, 9, 37, 0, 0), price: 13.50 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "trendRay",
                                settings: {
                                    lineStyle:'orange'
                                }
                            }
                        }]
                    },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), price: 15.00 } },
                                 { name: 'point1', value: { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), price: 13.80 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "trendLine",
                                settings: {
                                    lineStyle:'blue'
                                }
                            }
                        }]
                    }]

                }, {
                    position: 'left',
                    showHorizontalLines: false,
                    showLabels: true,
                    limits: 'auto',
                    scalingType: 'linear',
                    minMove: 0.01,
                    numberFormat: 3,
                    series: [{
                        data: seriesData,
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
                                name: "line",
                                settings: {
                                    lineStyle:'purple'
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
                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Charting brainwaves</span></div>",
                    onRectChanged: function (rect) {
                    },
                    height: 30
                }
            }
        ]
    });
});

