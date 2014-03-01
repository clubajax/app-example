requirejs.config({
    baseUrl: '../../../',
    paths: {
        'main': './buildSystem/chart/output',
        'plugins': './src/plugins',
        'common': './src/common',
        'i18n': './lib/i18n'
    }
});

require([
        'main/chart',

        './src/chart/test/data',
        './src/chart/test/seriesData',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawingObjectEdition/drawingObjectEditor',
        'plugins/interaction/horizontalZoom/horizontalZoom',
        'plugins/interaction/verticalZoom/verticalZoom',
        'lib/jquery'
],function (main, data, seriesData, /*seriePainterFactory, */resourceMananger, Broker, Selection, Crosshair, DrawingObjectEditor, HorizontalZoom, VerticalZoom) {


    var $container = $('#parent'),
        broker = new Broker();

    broker.pluginsStack.push(new Selection());
    broker.pluginsStack.push(
        new DrawingObjectEditor({
            $domElement: $container,
            autoSnapCallback: function (snapTos) {
                var snapTo = null, length = snapTos.length, index = null, i, shortestDistance = Number.MAX_VALUE, distance;

                for (i = 0; i < length; i++) {

                    snapTo = snapTos[i];

                    distance = Math.sqrt(Math.pow(snapTo.distanceX, 2) + Math.pow(snapTo.distanceY, 2));

                    if (shortestDistance > distance) {
                        index = i;
                        shortestDistance = distance;
                    }
                }

                return index === null ? false : snapTos[index];


            }
        })
    );

    broker.pluginsStack.push(new Crosshair({ $domElement: $container }));
    broker.pluginsStack.push(new HorizontalZoom());
    broker.pluginsStack.push(new VerticalZoom());


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
                    series: [
                        {
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
                                        draw: {
                                            colorBear: '255, 0, 0',
                                            colorBull: '0, 255, 0',
                                            width: 0.5      // (px)
                                        },
                                        selection: {
                                            squareSide: 8,
                                            color: '255, 255, 255',
                                            width: 0.5
                                        },
                                        indication: {
                                            font: 'normal 11px AramidBook',
                                            color: '0, 0, 0'
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
                            }]
                        },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), price: null } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    draw: {
                                        color: '38, 238, 255',
                                        width: 1      // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
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
                                    draw: {
                                        color: '255, 255, 255',
                                        width: 1      // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
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
                                    draw: {
                                        color: '155, 55, 25',
                                        width: 1.5      // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                }
                            }
                        }]
                    },
                    {
                            definesScaling: false,
                            inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), price: 15.00 } },
                                     { name: 'point1', value: { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), price: 11.80 } }],
                            data: [],
                            layers: [{
                                isSelected: false,
                                chartType: {
                                    name: "trendLine",
                                    settings: {
                                        draw: {
                                            color: '155, 155, 125',
                                            width: 1.5     // (px)
                                        },
                                        selection: {
                                            squareSide: 8,
                                            color: '255, 255, 255',
                                            width: 0.5
                                        }
                                    }
                                }
                            }]
                        },
                    ]

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
                                    draw: {
                                        color: '0, 255, 0',
                                        width: 0.5      // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    },
                                    indication: {
                                        font: 'normal 11px AramidBook',
                                        color: '0, 0, 0'
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
                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Charting brainwaves</span></div>",
                    onRectChanged: function (rect) {
                    },
                    height: 30
                }
            }
        ],
        style: {
            backgroundColor: '#000',
            axes: {
                color: 'rgba(62, 65, 70,1)',
                width: 1
            },
            label: {
                color: 'rgba(235, 235, 235, 1)',
                font: 'normal 11px AramidBook'
            },
            grid: {
                intraDayColor: 'rgba(23, 26, 32, 1)',
                horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            },
            crosshair: {
                draw: {
                    color: 'rgba(0, 255, 255, 1)',
                    width: 1
                },
                indication: {
                    color: 'rgba(0, 0, 0, 1)',
                    font: 'normal 11px AramidBook'
                }
            }
        },
        onViewPortLeftMarginChange: function (margin) {
        },
        onViewPortRightMarginChange: function (margin) {
        }
    });
});

