requirejs.config({
    baseUrl: '../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'lib': './src/lib',
        'i18n': './src/lib/i18n',
        'test': './test',

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
    'test/data/barData-m1',
    'test/data/barData-m2',
    'test/data/barData-m3',
    'test/data/barData-m4',
    'test/data/atData-1',
    'test/data/atData-2',
    'test/data/atData-3',
    'test/data/atData-4',
    'jquery',
    'chart/main',
    'chart/ChartRenderer',
    'chart/SeriePainters/SeriePainterFactory',
    'plugins/resourceManager/ResourceManager',
    'chart/axes/YAxisPosition',
    'chart/scalers/LogarithmicScaler',
    'chart/scalers/LinearScaler',
    'common/utilities',
    'common/ChartTypes'
], function (barData1, barData2, barData3, barData4, atData1, atData2, atData3, atData4, $,
             main, ChartRenderer, seriePainterFactory, resourceMananger, yAxisPosition, LogarithmicScaler, LinearScaler, utilities, chartTypes) {

    var
        Chart = main.Chart, //ChartRenderer,
        $container1 = $('#parent1'), $container2 = $('#parent2'), $container3 = $('#parent3'), $container4 = $('#parent4'),
        indexedData1 = [],
        indexedData2 = [],
        indexedData3 = [],
        indexedData4 = [],

        date = new Date(2012, 7, 7, 9, 37, 0, 0),
        delta = 580000,
        timeStamp1,
        timeStamp2,
        timeStamp3,
        timeStamp4,
        settings1,
        settings2,
        settings3,
        settings4,
        i = 0, j = 0, k = 0, l = 0;

    Date.prototype.addHours = function (h) {
        this.setHours(this.getHours() + h);
        return this;
    };

    for (; i < barData1.length; i++) {

        timeStamp1 = new Date("08-22-2012 12:00:00 AM");
        timeStamp1 = timeStamp1.addHours(i); //adding hours at regular interval

        indexedData1.push({
            timeStamp: timeStamp1
        });

        indexedData1.push({
            timeStamp: timeStamp1
        });

        barData1[i].indexedDataPoint = indexedData1[i];
        barData1[i].timeStamp = timeStamp1;

        atData1[i].indexedDataPoint = indexedData1[i];
        atData1[i].timeStamp = timeStamp1;
    }

    for (; j < barData2.length; j++) {

        timeStamp2 = new Date(date.getTime() + (j * delta));

        indexedData2.push({
            timeStamp: timeStamp2
        });

        barData2[j].indexedDataPoint = indexedData2[j];
        barData2[j].timeStamp = timeStamp2;

        atData2[j].indexedDataPoint = indexedData2[j];
        atData2[j].timeStamp = timeStamp2;
    }

    for (; k < barData3.length; k++) {

        timeStamp3 = new Date(date.getTime() + (k * delta));

        indexedData3.push({
            timeStamp: timeStamp3
        });

        barData3[k].indexedDataPoint = indexedData3[k];
        barData3[k].timeStamp = timeStamp3;

        atData3[k].indexedDataPoint = indexedData3[k];
        atData3[k].timeStamp = timeStamp3;
    }

    for (; l < barData4.length; l++) {

        timeStamp4 = new Date(date.getTime() + (l * delta));

        indexedData4.push({
            timeStamp: timeStamp4
        });

        barData4[l].indexedDataPoint = indexedData4[l];
        barData4[l].timeStamp = timeStamp4;

        atData4[l].indexedDataPoint = indexedData4[l];
        atData4[l].timeStamp = timeStamp4;
    }

    //#region Chart1
    settings1 = {
        rect: { top: 10, bottom: 20, right: 10, left: 10 },
        painterFactory: seriePainterFactory,
        resourceManager: resourceMananger,
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 100,
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true
        },
        indexedData: {
            data: indexedData1,
            beginIndex: 0,
            endIndex: barData1.length - 1
        },
        timeAxis: {
            labelAxisDistance: 9,
            labelBorderDistance: 2,
            markerLength: 6,
            minLabelDistance: 10,
            showLabels: true,
            showVerticalLines: true
        },
        subGraphs: [],
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
                //horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            }
        }
    };

    window.chart1 = new Chart($container1, settings1);
console.log('chart added...');

    window.chart1.subGraphs.push({

        realEstatePercentage: 0.5,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData1,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData1.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: true,
                    chartType: chartTypes.line,
                    dataPointDefinitions: [{
                        key: 1,
                        indication: true,
                        //Auto Format
                        formatter: utilities.getFormatter(0)
                    }],
                    style: {
                        draw: {
                            width: 0.5,
                            color: '0, 255, 255',
                            radius: 1
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 1
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }, {
                    isSelected: false,
                    chartType: chartTypes.band,
                    dataPointDefinitions: [{
                        key: 0,
                        indication: 0,
                        //Auto Format
                        formatter: utilities.getFormatter(0)
                    }, {
                        key: 2,
                        indication: 1,
                        //Auto Format
                        formatter: utilities.getFormatter(0)
                    }],
                    style: {
                        draw: {
                            colors: ['255, 0, 0', '0, 255, 0'],
                            width: 0.5,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.55', offset: '1'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial; color:#FFF; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Logarithmic Band Chart | Selection | Grid</div>",
        headerHeight: 20,
        onHeaderRectChanged: function (headerRect) {

        }
    });

    window.chart1.subGraphSizeChanged([100]);

    
    console.log('ONE CHART'); return;

    settings2 = {
        painterFactory: seriePainterFactory,
        resourceManager: resourceMananger,
        indexedData: {
            data: indexedData2,
            beginIndex: 0,
            endIndex: barData2.length - 1
        },
        timeAxis: {
            labelAxisDistance: 9,
            labelBorderDistance: 2,
            markerLength: 6,
            minLabelDistance: 30,
            showLabels: true,
            showVerticalLines: true
        },
        subGraphs: [],
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
                //horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            },
            draw: {
                colorBear: '255, 0, 0',
                colorBull: '0, 255, 0',
                width: 0.5      // (px)
            }
        }
    };

    window.chart2 = new Chart($container2, settings2);

    window.chart2.subGraphs.push({
        realEstatePercentage: 1,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.right,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(),
            minMove: 0.01,
            numberFormat: 3,
            formatter: utilities.getFormatter(3),
            series: [{
                data: barData2,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: barData2.length - 1,
                        maxValue: null
                    },
                    value: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.area,
                    dataPointDefinitions: [{
                        key: 0,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            color: '0, 255, 0',
                            width: 1,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.15', offset: '1'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; height: 80px; text-align:center; width:100%; background-color:grey;'>Right Axis Candle Stick | Selection | Grid</div>",
        headerHeight: 20,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart2.subGraphSizeChanged([100]);

    window.chart2.subGraphs.push({
        realEstatePercentage: 0.5,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData2,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData2.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: true,
                    chartType: chartTypes.area,
                    dataPointDefinitions: [{
                        key: 1,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            color: '0, 255, 255',
                            width: 1,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.15', offset: '1'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 1
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }, {
                    isSelected: false,
                    chartType: chartTypes.band,
                    dataPointDefinitions: [{
                        key: 0,
                        indication: 0
                    }, {
                        key: 2,
                        indication: 1,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            colors: ['255, 0, 0', '0, 255, 0'],
                            width: 0.5,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.55', offset: '1'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Band Chart | Selection | Grid</div>",
        headerHeight: 20,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart2.subGraphSizeChanged([50, 50]);

    //#endregion

    //#region Chart3
    settings3 = {
        painterFactory: seriePainterFactory,
        resourceManager: resourceMananger,
        indexedData: {
            data: indexedData3,
            beginIndex: 0,
            endIndex: barData3.length - 1
        },
        timeAxis: {
            labelAxisDistance: 9,
            labelBorderDistance: 2,
            markerLength: 6,
            minLabelDistance: 30,
            showLabels: true,
            showVerticalLines: true
        },
        subGraphs: [],
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
                //horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            }
        }
    };

    window.chart3 = new Chart($container3, settings3);

    window.chart3.subGraphs.push({
        realEstatePercentage: 1,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.right,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(),
            minMove: 0.01,
            numberFormat: 3,
            formatter: utilities.getFormatter(3),
            series: [{
                data: barData3,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: barData3.length - 1,
                        maxValue: null
                    },
                    value: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.ohlc,
                    dataPointDefinitions: [{
                        key: 0
                    }, {
                        key: 1
                    }, {
                        key: 2
                    }, {
                        key: 3,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            width: 0.5,
                            color: '0, 255, 0'
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Right Axis OHLC Chart | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart3.subGraphSizeChanged([100]);

    window.chart3.subGraphs.push({
        realEstatePercentage: 0.33,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData3,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData3.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.circle,
                    dataPointDefinitions: [{
                        key: 1,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            width: 0.5,
                            color: '0, 255, 255',
                            radius: 1
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 1
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],

        headerDomElement: "<div style='font-family:Arial;color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Circle Chart | Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart3.subGraphSizeChanged([50, 50]);

    window.chart3.subGraphs.push({
        realEstatePercentage: 0.33,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4.60
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData3,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData3.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.histogram,
                    dataPointDefinitions: [{
                        key: 0,
                        indication: 0
                    }],
                    style: {
                        draw: {
                            width: 0.75,
                            color: '0, 255, 0'
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial; color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Histogram | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart3.subGraphSizeChanged([33.33, 33.33, 33.33]);
    //#endregion

    //#region Chart4
    settings4 = {
        painterFactory: seriePainterFactory,
        resourceManager: resourceMananger,
        indexedData: {
            data: indexedData4,
            beginIndex: 0,
            endIndex: barData4.length - 1
        },
        timeAxis: {
            labelAxisDistance: 9,
            labelBorderDistance: 2,
            markerLength: 6,
            minLabelDistance: 30,
            showLabels: true,
            showVerticalLines: false
        },
        subGraphs: [],
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
                //horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            }
        }
    };

    window.chart4 = new Chart($container4, settings4);

    window.chart4.subGraphs.push({
        realEstatePercentage: 1,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.right,
            showLabels: true,
            limits: {
                maxValue: 17,
                minValue: 4
            },
            scaler: new LinearScaler(),
            minMove: 0.01,
            numberFormat: 3,
            formatter: utilities.getFormatter(3),
            series: [{
                data: barData4,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: barData4.length - 1,
                        maxValue: null
                    },
                    value: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.line,
                    dataPointDefinitions: [{
                        key: 1,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            width: 1,
                            color: '255, 0, 255',
                            radius: 1
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 1
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Right Axis Line Chart | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart4.subGraphSizeChanged([100]);

    window.chart4.subGraphs.push({
        realEstatePercentage: 0.25,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 17,
                minValue: 4
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData4,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData4.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.area,
                    dataPointDefinitions: [{
                        key: 1,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            color: '255, 165, 0',
                            width: 1,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.15', offset: '1' }, { alpha: '0.55', offset: '2' }, { alpha: '0.15', offset: '3'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 1
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Area Chart | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart4.subGraphSizeChanged([50, 50]);

    window.chart4.subGraphs.push({
        realEstatePercentage: 1,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.right,
            showLabels: true,
            limits: {
                maxValue: 18,
                minValue: 4
            },
            scaler: new LinearScaler(),
            minMove: 0.01,
            numberFormat: 3,
            formatter: utilities.getFormatter(3),
            series: [{
                data: barData4,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: barData4.length - 1,
                        maxValue: null
                    },
                    value: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.candlestick,
                    dataPointDefinitions: [{
                        key: 0
                    }, {
                        key: 1
                    }, {
                        key: 2
                    }, {
                        key: 3,
                        indication: true,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
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
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial;color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Right Axis Candle Stick | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart4.subGraphSizeChanged([33.33, 33.33, 33.33]);

    window.chart4.subGraphs.push({
        realEstatePercentage: 0.25,
        yScaleGroups: [{
            showHorizontalLines: true,
            axisPosition: yAxisPosition.left,
            showLabels: true,
            limits: {
                maxValue: 17,
                minValue: 4
            },
            scaler: new LinearScaler(), //new LogarithmicScaler(),
            minMove: 0.01,
            formatter: utilities.getFormatter(3),
            numberFormat: 3,
            series: [{
                data: atData4,
                limits: {
                    time: {
                        minValueIndex: 0,
                        minValue: null,
                        maxValueIndex: atData4.length - 1,
                        maxValue: null
                    },
                    price: {
                        minValueIndex: null,
                        minValue: null,
                        maxValueIndex: null,
                        maxValue: null
                    }
                },
                sections: [{
                    isSelected: false,
                    chartType: chartTypes.band,
                    dataPointDefinitions: [{
                        key: 0,
                        indication: 0
                    }, {
                        key: 2,
                        indication: 1,
                        formatter: utilities.getFormatter(3)
                    }, {
                        key: 1,
                        indication: 1,
                        formatter: utilities.getFormatter(3)
                    }],
                    style: {
                        draw: {
                            colors: ['255, 0, 0', '0, 0, 255'],
                            width: 0.5,      // (px)
                            gradient: [{ alpha: '0.55', offset: '0' }, { alpha: '0.55', offset: '1'}]
                        },
                        selection: {
                            squareSide: 8,
                            color: '255, 255, 255',
                            width: 0.5
                        },
                        indication: {
                            fontColor: '0,0,0'
                        }
                    }
                }]
            }]
        }],
        headerDomElement: "<div style='font-family:Arial; color:#FFF; font-size:10px; height: 80px; text-align:center; width:100%; background-color:grey;'>Left Axis Band Chart | No Selection | Grid</div>",
        headerHeight: 12,
        onHeaderRectChanged: function (headerRect) {
        }
    });

    window.chart4.subGraphSizeChanged([25, 25, 25, 25]);
    //#endregion

});
