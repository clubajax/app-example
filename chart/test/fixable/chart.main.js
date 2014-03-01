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
    'test/data/bardata',
    'test/data/movavg',
    'jquery',
    "chart/Chart",
    "chart/SeriePainters/SeriePainterFactory",
    "plugins/resourceManager/ResourceManager",
    "plugins/superScroller/HorizontalScrollbar",
    "chart/axes/YAxisPosition",
    "chart/scalers/LogarithmicScaler",
    "chart/scalers/LinearScaler",
    "common/utilities",
    "common/ChartTypes",
    "plugins/statusLine/StatusRenderer",
    'plugins/resourceManager/ResourceManager'
], function (barData, movAvg, $, Chart, seriePainterFactory, resourceMananger, HorizontalScrollbar, yAxisPosition, LogarithmicScaler, LinearScaler, utilities, chartTypes, StatusLineRenderer, resourceManager) {

    resourceMananger = resourceMananger;

    var $container = $('#parent'),
        date = new Date(2012, 7, 7, 9, 37, 0, 0),
        delta = 420000,
        timeStamp,
        i = 0,
        isScrolling,
        prevViewPortLeftMargin = 0,
        currentViewPortLeftMargin = 0,
        prevViewPortRightMargin = 0,
        currentViewPortRightMargin = 0,
        prevHeaderRect = {left: 0, top: 0, right: 0, bottom: 0},
        currentHeaderRect = { left: 0, top: 0, right: 0, bottom: 0 },
        style = {
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
        },
        settings = {
            painterFactory: seriePainterFactory,
            resourceManager: resourceMananger,
            xAxis: {
                limits: 'auto',
                maximumNumberOfVisibleBars: 60,
                minimumNumberOfVisibleBars: 5,
                showLabels: true,
                showVerticalLines: true
            },
            graphs: [],

            onViewPortLeftMarginChange: function (margin) {
                if (isScrolling && window.scrollbar) {
                    currentViewPortLeftMargin = margin;
                } else {
                    currentViewPortLeftMargin = margin;
                    prevViewPortLeftMargin = margin;
                    window.scrollbar.leftHandleMarging(margin);
                }
            },
            onViewPortRightMarginChange: function (margin) {
                if (isScrolling && window.scrollbar) {
                    currentViewPortRightMargin = margin;
                } else {
                    currentViewPortRightMargin = margin;
                    prevViewPortRightMargin = margin;

                    window.scrollbar.rightHandleMarging(margin);
                }
            }
        },
        scrollbarSettings = {
            totalRange: {
                minValue: 0,
                maxValue: barData.length - 1
            },
            activeRange: {
                minValue: 0,
                maxValue: 0
            },
            leftHandleMarging: currentViewPortLeftMargin,
            rightHandleMarging: currentViewPortRightMargin,
            onBeginRangeChangeCallback: function () {
                isScrolling = true;
            },
            onRangeChangeCallback: function (range) {
                var actualLimits = window.chart.xAxis().getActualLimits();
                if (range.minValue !== actualLimits.minValueIndex || range.maxValue !== actualLimits.maxValueIndex) {
                    window.chart.xAxis().limits({
                        minValueIndex: range.minValue,
                        maxValueIndex: range.maxValue
                    });
                }
            },
            onEndRangeChangeCallback: function () {
                isScrolling = false;

                if (prevViewPortRightMargin !== currentViewPortRightMargin) {
                    prevViewPortRightMargin = currentViewPortRightMargin;
                    window.scrollbar.rightHandleMarging(currentViewPortRightMargin);
                }

                if (prevViewPortLeftMargin !== currentViewPortLeftMargin) {
                    prevViewPortLeftMargin = currentViewPortLeftMargin;
                    window.scrollbar.rightHandleMarging(currentViewPortLeftMargin);
                }

                if (prevHeaderRect.rigth !== currentHeaderRect.right || prevHeaderRect.left !== currentHeaderRect.left) {
                    //window.statusLineRenderer.rect(currentHeaderRect);
                    prevHeaderRect = currentHeaderRect;
                }
            }
        };

    window.chart = new Chart($container, settings);


    var subGraphSettings = {
        realEstatePercentage: 1,
        axes: [{
            axisPosition: yAxisPosition.right,
            showHorizontalLines: true,
            showLabels: true,
            limits: 'auto',
            fixed: {
                maxValue: 15.31,
                minValue: 4.92
            },
            scalingType: 'Linear',
            minMove: 0.01,
            numberFormat: 3,
            series: [{
                data: [], //barData,
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
                    isSelected: true,
                    chartType: {
                        name: chartTypes.candlestick,
                        settings: {
                            draw: {
                                colorBear: '0, 255, 0',
                                colorBull: '255, 0, 0',
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
                            indication: true,
                            formatter: utilities.getFormatter(3)
                        }]
                    }

                }]
            }]
        }],
        header: {
            domElement: "<H1>Header</H1>", //window.statusLineRenderer.domElement,
            onRectChanged: function (rect) {

                if (isScrolling) {
                    currentHeaderRect = rect;
                } else {
                    //window.statusLineRenderer.rect(rect);
                    currentHeaderRect = rect;
                    prevHeaderRect = rect;
                }
            },
            height: 20
        }
    };

    console.log('add graph');
    window.chart.graphs.push(subGraphSettings);

    var updateScrollbar = function () {
        window.scrollbar = new HorizontalScrollbar($container, scrollbarSettings);

        var maxValue = window.chart.xAxis().totalRangeMax();
        var actualLimits = window.chart.xAxis().getActualLimits();

        window.scrollbar.totalRange(
        {
            minValue: 0,
            maxValue: maxValue
        });

        window.scrollbar.activeRange(
        {
            minValue: actualLimits.minValueIndex,
            maxValue: actualLimits.maxValueIndex
        });

    };

console.log('add serie');
    var serie = window.chart.graphs(0).axes(0).series(0), dataLength = barData.length;


    for (var j = 0; j < dataLength; j++) {
        timeStamp = new Date(date.getTime() + (j * delta));
        barData[j].timeStamp = timeStamp;
    }

    var addRandomIndex = function () {
        var result, index = Math.round(Math.random() * dataLength);
        if (index > dataLength - 1) {
            index = dataLength - 1;
        }
        //timeStamp = new Date(date.getTime() + (index * delta));
        //barData[index].timeStamp = timeStamp;
        result = serie.data.add(barData[index]);
        if (!result.found) {
            barData.splice(index, 1);
            dataLength = barData.length;
            console.log(dataLength);
            i++;
        }
        if (dataLength) {
            setTimeout(addRandomIndex, 0);
        } else {

            serie.data.removeAt(10, 100);
            //updateScrollbar();
        }
    };

    addRandomIndex();



});
