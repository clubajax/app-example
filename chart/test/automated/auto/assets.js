define([
    'test/data/timestamped',
    'test/data/timestamped_plots',
    'test/data/timestamped-samegraph',
    'auto/dataTipSettings',
    'chart/main',
    'plugins/resourceManager/ResourceManager',
    'plugins/interaction/broker/broker',
    'plugins/interaction/selection/selection',
    'plugins/interaction/crosshair/crosshair',
    'plugins/interaction/drawing/DrawingCreator',
    'plugins/interaction/verticalZoom/verticalZoom',
    'plugins/interaction/datatip/Datatip',
    'plugins/superScroller/HorizontalScrollBar',
    'common/ChartTypes'
    
], function(timestamped, timestamped_plots, timestamped_samegraph, dataTipSettings, main, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, VerticalZoom, Datatip, HorizontalScrollBar, chartTypes){

    function limits(){
        return {
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
        };
    }


    window.addEventListener('resize', function(){
        if(assets.chart){
            assets.chart.resize();
        }
    }, false);



    var
    chartNode = document.getElementById('chart'),

    xAxis = {
        limits: 'auto',
        maximumNumberOfVisibleBars: 40, // 60
        minimumNumberOfVisibleBars: 5,
        showLabels: true,
        showVerticalLines: true
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
    },
    assets = {
        getDisposeChartTest: function(){
            return {
                title:'Dispose chart',
                run: function(){
                    if(assets.chart){
                        assets.chart.dispose();
                        assets.chart = null;
                    }
                }
            };
        },
        getStandardChartTest: function (title, data){
            return {
                title:title || 'Create chart',
                run: function(){
                    if(assets.chart){
                        assets.chart.dispose();
                    }
                    assets.chart = assets.createChart({
                        node:chartNode,
                        graphs: assets.graphs.get({
                            type:'single',
                            series:assets.series.get({
                                serieId:'MAIN_SERIE',
                                type:'single',
                                data: data || assets.data.get('timestamped', [0,0.5])
                            })

                        })
                    });
                }
            };
        },

        
        mouse: function(self, speed, x, y, increment, count){
            var
                h;

            assets.chart.mouseControl.down(x, y);
            h = setInterval(function(){
                x += increment;
                y += increment;
                assets.chart.mouseControl.move(x, y);
                if(count-- < 0){
                    assets.chart.mouseControl.up(x, y);
                    clearInterval(h);
                    self.end();
                }
            }, speed);
        },

        data:{
            // may need getData, to get copies
            timestamped:[].concat(timestamped),
            timestamped_plots:[].concat(timestamped_plots),
            timestamped_samegraph:[].concat(timestamped_samegraph),
            get: function(name, range){
                var
                    beg, end,
                    data = [].concat(this[name]);
                if(!data){
                    throw new Error('Data name does not exist: ' + name);
                }
                if(range){
                    beg = Math.ceil(range[0]) === range[0] ? range[0] : Math.ceil(range[0] * data.length);
                    end = Math.ceil(range[1]) === range[1] ? range[1] : Math.ceil(range[1] * data.length);
                    return data.slice(beg, end);
                }

                return data;
            }
        },
        series:{
            single: function(options){
                return [{
                    id:options.serieId,
                    data: options.data,
                    limits: limits(),
                    layers: [{
                        id:options.sectionId,
                        isSelected: false,
                        chartType: chartTypeArea //chartTypeOhlc
                    }]
                }];
            },

            redline: function(options){
                return [{
                    data: options.data,
                    limits: limits(),
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
                }];
            },


            indicator: function(options){
                return {
                    id:options.serieId,
                    data: options.data,
                    limits: limits(),
                    layers: [{
                        id:options.layerId,
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
            },

            get: function(options){
                return this[options.type](options);
            }
        },
        graphs:{
            single: function(options){
                return [{
                    id:options.graphId,
                    realEstatePercentage: 1,
                    axes: [{
                        position: 'right',
                        showHorizontalLines: true,
                        showLabels: true,
                        limits: 'auto',
                        scalingType: 'linear',
                        minMove: 0.01,
                        numberFormat: 3,
                        series: options.series
                    }]
                }];
            },


            get: function(options){
                return this[options.type](options);
            }
        },
        createChart: function(options){
            var
                container = options.node || document.getElementById(options.nodeId),
                broker = new Broker(),
                chart = new main.Chart(container, {
                    resourceManager: resourceMananger,
                    onEventCallback: function (eventType, eventObject) {
                        return broker.onEventCallback(eventType, eventObject);
                    },
                    xAxis: xAxis,
                    graphs: options.graphs
                });
                this.chart = chart;
                broker.setChart(chart);
                this.broker = broker;
                this.containerNode = container;
            return chart;
        },
        plugins:{
            crosshair: function(){
                assets.broker.add(new Crosshair({ $domElement: assets.containerNode }));
            },
            selection: function(){
                assets.broker.add(new Selection());
            },
            datatip: function(){
                // needs to be added before crosshair
                var datatip = new Datatip({
                    alwaysEnabled: false,
                    forwardEvent: true,
                    onRetrieveSettings: dataTipSettings,
                    delay: 500
                }, 0);

                assets.broker.add(datatip, 0);
            },
            drawing: function(){
                var drawing = new DrawingCreator({
                    $domElement: chartNode,
                    broker: assets.broker,
                    defaultAxisIndex: 0,
                    isActive: false,
                    isPersistent: false,
                    drawingTemplate: null
                });

                assets.broker.add(drawing);
            }
        }
    };

    return assets;
});
