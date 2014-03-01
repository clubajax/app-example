define([

    'common/ChartTypes'

], function(chartTypes){

    return function(chart, type, serieId, color){
        var
            serie, options, section,

            // dataPointDefinitions.key needs to be correct or it will render a
            // very different looking graph.
            //
            // Currently it matters if OHLC or Area is selected first.
            // 
            map = {
                area:{
                    isSelected:false,
                    chartType: {
                        name:"area",
                        settings:{
                            color:'green'
                        },
                        dataPointDefinitions: [{
                            key: 0,
                            indication: 1
                        }]
                    }
                },
                line:{
                    isSelected:false,
                    chartType: {
                        name:"line",
                        settings:{
                            lineStyle: color || 'green'
                        },
                        dataPointDefinitions: [{
                            key: 0,
                            indication: 1
                        }]
                    }
                },
                candlestick:{
                    isSelected:false,
                    chartType: {
                        name:"candlestick",
                        settings:{
                            lineStyle:color || 'stopgo'
                        },
                        dataPointDefinitions: [{
                            key: 0,
                            indication: 0
                        },{
                            key: 1,
                            indication: 0
                        },{
                            key: 2,
                            indication: 0
                        },{
                            key: 3,
                            indication: 1
                        }]
                    }
                },
                ohlc:{
                    isSelected:false,
                    chartType: {
                        name:"ohlc",
                        settings:{
                            lineStyle:color || 'green'
                        },
                        dataPointDefinitions: [{
                            key: 0,
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
                    }
                }
            };

        //console.log('this.settings', this.settings);

        if(!map[type]){
            console.error('No chart type of:', type);
            return;
        }

        serie = chart.getSerie(serieId);
        section = chart.getSection();
        if (!!serie) {
            options = map[type];
            section.changeChart(type, options.chartType.settings, options.chartType.dataPointDefinitions);
        }

    };
});
