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

var limits = {
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
chartTypeArea = {
    name: "area",
    settings: {
        lineStyle:'purple'
    },
    dataPointDefinitions: [{
        key: 0,
        indication: 1
    }]
},
chartTypeOhlc = {
    name:"ohlc",
    settings:{
        lineStyle:'green'
    },
    dataPointDefinitions: [{
        key: 1,
        indication: 1
    },{
        key: 1,
        indication: 0
    },{
        key: 2,
        indication: 0
    },{
        key: 3,
        indication: 0
    }]
};

require([
        'jquery',
        'chart/main',

        'test/data/timestamped',
        'test/data/timestamped_plots',
        'test/data/timestamped-samegraph',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawing/DrawingCreator',
        'plugins/interaction/verticalZoom/verticalZoom',
        'common/ChartTypes',
        'plugins/superScroller/HorizontalScrollBar'
],function ($, main, data, plots, indicator_plots, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, VerticalZoom, chartTypes, HorizontalScrollBar) {

    var $container = $('#chart'),
        broker = new Broker(),
        drawing,
        realTimeHandle,
        realtimeTime = 200,
        lastDate,
        changeTime = true,
        running = false,
        realtime = data.splice(Math.floor(data.length/2), data.length),
        history = data.splice(0, data.length),
        realtimePlots = plots.splice(Math.floor(plots.length/2), plots.length),
        historyPlots = plots.splice(0, plots.length),

        indicatorRealtime = indicator_plots.splice(Math.floor(indicator_plots.length/2), indicator_plots.length),
        indicatorHistory = indicator_plots.splice(0, indicator_plots.length),

        barToChange = history[20],
        subgraph,
        INDICATOR_ID = 'INDICATOR',
        SERIE_INDICATOR_ID = 'SERIE_INDICATOR';

    //console.log('history', history);

    lastDate = history[history.length-1].timeStamp;

    function addBar(serie, bar){
        if(!changeTime){
            bar.timeStamp = lastDate;
        }
        serie.data.add(bar);

    }

    window.stopRealtime = function(){
        console.log('stop');
        clearInterval(realTimeHandle);
        running = 0;
    };

    window.runRealtime = function(){
        if(running){return;}
        running = 1;

        var
            graph,
            indicator,
            serie = window.chart.getSerie('MAIN_SERIE');

        console.log('GRAPH', window.chart.graphs(1));

        realTimeHandle = setInterval(function(){

            addBar(serie, realtime.shift());

            var plot = realtimePlots.shift();
            if(graph){
                addBar(graph, plot);
            }
            if(indicator){
                addBar(indicator, plot);
            }

            if(!realtime.length){
                clearInterval(realTimeHandle);
            }
        }, realtimeTime);
    };

    window.changeBar = function(){
        console.log('barToChange', barToChange);
        var i, serie, bar = {
            timeStamp: new Date(barToChange.timeStamp),
            values:[]
        };

        for(i = 0; i < barToChange.values.length; i++){
            bar.values[i] = {
                value:barToChange.values[i].value + 0
            };
        }

        bar.values[0].value += 1;

        serie = window.chart.getSerie();
        serie.data.add(bar);
    };

    window.addGraph = function(){
        var
            graph = {
                IS_SETTINGS_OBJECT:1,
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
                        data: historyPlots,
                        limits: limits,
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "line",
                                settings: {
                                    lineStyle:'red'
                                },
                                dataPointDefinitions: [{
                                    key: 0,
                                    indication: true
                                }]
                            }
                        }]
                    }]
                }],
                header: {
                    domElement: "<div style='width:100%; text-align:center;font-size: 18px'><span style='color: blue'>New Graph</span></div>",
                    onRectChanged: function (rect) {},
                    height: 20
                }
            };
        subgraph = window.chart.addGraph(graph);
    };

    window.removeGraph = function(){
        window.chart.removeGraph(subgraph);
        //window.chart.graphs.splice(1, 1);
    };
    window.clearGraphs = function(){
        window.chart.clearGraphs();
        //window.chart.graphs.splice(1, 1);
    };

    window.addIndicatorX = function(){
        var
            groupId = window.chart.graphs(0).groups.get(0).id,
            graphId = window.chart.graphs(0).id,
            series = {
                id:SERIE_INDICATOR_ID,
                data: historyPlots,
                limits: limits,
                layers: [{
                    id:INDICATOR_ID,
                    isSelected: false,
                    chartType: {
                        name: "area",
                        settings: {
                            lineStyle:'green'
                        },
                        dataPointDefinitions: [{
                            key: 0,
                            indication: true
                        }]
                    }
                }]
            };

        window.chart.addSerie(graphId, groupId, series, 1);
    };

    window.addIndicator = function(){
        var
            groupId = window.chart.graphs(0).groups.get(0).id,
            graphId = window.chart.graphs(0).id,
            series = {
                id:SERIE_INDICATOR_ID,
                data: indicatorHistory,
                limits: limits,
                layers: [{
                    id:INDICATOR_ID,
                    isSelected: false,
                    chartType: {
                        name: "line",
                        settings: {
                            lineStyle:'green'
                        },
                        dataPointDefinitions: [{
                            key: 0,
                            indication: true
                        }]
                    }
                }]
            };

        window.chart.addSerie(graphId, groupId, series, 1);
    };

    window.removeIndicator = function(){
        window.chart.removeSerie(SERIE_INDICATOR_ID);
    };

    //setTimeout(function(){ addIndicator(); }, 100);

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
                id:'MAIN_GRAPH',
                IS_SETTINGS_OBJECT:1,
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
                        id:'MAIN_SERIE',
                        data: history,
                        limits: limits,
                        layers: [{
                            id:'MAIN_SECTION',
                            isSelected: false,
                            chartType: chartTypeArea //chartTypeOhlc
                        }]
                    }]
                }]
            }
        ]
    });

    broker.setChart(window.chart);
    broker.add(new Selection());
    broker.add(new Crosshair({ $domElement: $container }));
    broker.add(new VerticalZoom());

    window.scrollbar = new HorizontalScrollBar({
        broker:broker
    }, $container);

    window.addEventListener('resize', function(){
        window.chart.resize();
    }, false);
});

