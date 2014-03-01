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

        'test/data/timestamped',
        'test/data/series',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawing/DrawingCreator',
        'plugins/interaction/horizontalZoom/horizontalZoom',
        'plugins/interaction/verticalZoom/verticalZoom',
        'common/ChartTypes',
        'plugins/superScroller/HorizontalScrollBar'
],function ($, main, data, seriesData, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, HorizontalZoom, VerticalZoom, chartTypes, HorizontalScrollBar) {

    var $container = $('#chart'),
        broker = new Broker(),
        drawing,
        realTimeHandle,
        realtimeTime = 200,
        realtime = data.splice(Math.floor(data.length/2), data.length),
        history = data.splice(0, data.length),

        prevViewPortLeftMargin = 0,
        currentViewPortLeftMargin = 0,
        prevViewPortRightMargin = 0,
        currentViewPortRightMargin = 0,
        isScrolling,
        axis,
        limits,
        totalRange,
        isVisible;

    console.log('history', history);

    broker.add(new Selection());

    //broker.add(new Crosshair({ $domElement: $container }));
    broker.add(new HorizontalZoom({
        onRangeChangeCallback: function (range) {
            window.scrollbar.activeRange(range);
        }
    }));
    broker.add(new VerticalZoom());
    broker.add(new Selection());

    function addBar(bar){

        var axis = window.chart.graphs(0).axes(0),
                serie;

            if(axis){
                serie = axis.series(0);
                serie.data.add(bar);
            }
    }

    window.stopRealtime = function(){
        clearInterval(realTimeHandle);
    };

    window.runRealtime = function(){
        realTimeHandle = setInterval(function(){

            addBar(realtime.shift());

            if(!realtime.length){
                clearInterval(h);
            }
        }, realtimeTime);
    };

    window.chart = new main.Chart($container, {
        resourceManager: resourceMananger,
        userInteractionType: main.userInteractionTypes.desktop,
        onEventCallback: function (eventType, eventObject) {
            return broker.onEventCallback(eventType, eventObject);
        },
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 100, // 60
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true,
            onLimitsChanged: function (newLimits) {
                var actualLimits = newLimits.limits,
                totalRange = newLimits.total,
                    currentRange;
                if (totalRange) {
                    if (actualLimits) {
                        currentRange = window.scrollbar.totalRange().maxValue;

                        //to avoid multiple changes, we check first.
                        if (actualLimits.maxValueIndex< currentRange) {
                            window.scrollbar.activeRange({ minValue: actualLimits.minValueIndex, maxValue: actualLimits.maxValueIndex });
                            window.scrollbar.totalRange({ minValue: 0, maxValue: totalRange });
                        } else {
                            window.scrollbar.totalRange({ minValue: 0, maxValue: totalRange });
                            window.scrollbar.activeRange({ minValue: actualLimits.minValueIndex, maxValue: actualLimits.maxValueIndex });
                        }
                        if(!window.scrollbar.isVisible()){
                            window.scrollbar.isVisible(true);
                        }
                    } else {
                        window.scrollbar.isVisible(false);
                    }
                } else {
                    window.scrollbar.isVisible(false);
                }
            }
        },
        onViewPortLeftMarginChange: function (margin) {
            window.scrollbar.leftHandleMargin(margin);
        },
        onViewPortRightMarginChange: function (margin) {
            window.scrollbar.rightHandleMargin(margin);
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
                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Charting brainwaves</span></div>",
                    onRectChanged: function (rect) {
                    },
                    height: 30
                }
            }
        ]
    });

    axis = window.chart.xAxis();
    limits = axis.getActualLimits();
    totalRange = axis.totalRangeMax();
    isVisible = limits && totalRange > 0;

    window.scrollbar = new HorizontalScrollBar($container,{
        totalRange: {
            minValue: 0,
            maxValue: isVisible? totalRange : 0
        },
        activeRange: {
            minValue: isVisible? limits.minValueIndex: 0,
            maxValue: isVisible? limits.maxValueIndex: 0
        },
        isVisible : isVisible,
        leftHandleMargin: currentViewPortLeftMargin,
        rightHandleMargin: currentViewPortRightMargin,
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
                window.scrollbar.rightHandleMargin(currentViewPortRightMargin);
            }

            if (prevViewPortLeftMargin !== currentViewPortLeftMargin) {
                prevViewPortLeftMargin = currentViewPortLeftMargin;
                window.scrollbar.rightHandleMargin(currentViewPortLeftMargin);
            }
        }
    });
});

