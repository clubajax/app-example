define(['auto/assets'], function(assets){
    return {


        // add test: add and remove graph twice

        suite:'Graphs and Indicators',
        tests:[
            // ref 0
            assets.getStandardChartTest('Create Chart with Half Data', assets.data.get('timestamped', [0, 0.5])),
            // ref 1
            assets.getDisposeChartTest(),
            // ref 2
            assets.getStandardChartTest('Create Chart with Half Data'),
            {
                // ref 3
                skip:0,
                title:'Real Time data',
                end: function(){},
                run: function(){

                    var
                        self = this,
                        realtimeTime = 30,
                        h,
                        realtime = assets.data.get('timestamped', [0.5, Infinity]),
                        serie = assets.chart.getSerie('MAIN_SERIE');

                    assets.chart.chartType('candlestick', 'default', 'hotcold');

                    h = setInterval(function(){

                        serie.data.add(realtime.shift());

                        if(!realtime.length){
                            clearInterval(h);
                            self.end();
                        }
                    }, realtimeTime);
                }
            },
            assets.getDisposeChartTest(), // ref 4

            // must dispose and create a new chart here.
            // real time data is different than the data in the following tests
            assets.getStandardChartTest(), // ref 5

            {
                // ref 6
                title:'Add Graph',
                run: function(){
                    assets.chart.addGraph(assets.graphs.get({
                        graphId:'SUBGRAPH',
                        type:'single',
                        series:assets.series.get({
                            type:'redline',
                            serieId:'SUBSERIE',
                            // BUG?
                            // Can't add more data here than exists in current chart
                            // ergo, not the entire plots array
                            // it does work after realtime
                            data:assets.data.get('timestamped_plots', [0,0.5])
                        })

                    })[0]);
                }
            },
            {
                // ref 7
                title:'Add Indicator',
                run: function(){
                    var
                        groupId = assets.chart.graphs(0).groups.get(0).id,
                        graphId = assets.chart.graphs(0).id,
                        series = assets.series.get({
                            type:'indicator',
                            data: assets.data.get('timestamped_samegraph', [0,0.5]),
                            serieId:'SERIE_INDICATOR_ID',
                            layerId:'INDICATOR_ID'
                        });
                    assets.chart.addSerie(graphId, groupId, series, 1);
                }
            },
            {
                // ref 8
                title:'Remove Graph',
                run: function(){
                    assets.chart.removeGraph('SUBGRAPH');
                }
            },
            {
                // ref 6
                title:'Add Graph (again)',
                run: function(){
                    assets.chart.addGraph(assets.graphs.get({
                        graphId:'SUBGRAPH',
                        type:'single',
                        series:assets.series.get({
                            type:'redline',
                            serieId:'SUBSERIE',
                            data:assets.data.get('timestamped_plots', [0,0.5])
                        })

                    })[0]);
                }
            },
            {
                // ref 8
                title:'Remove Graph (testing remove twice)',
                run: function(){
                    assets.chart.removeGraph('SUBGRAPH');
                }
            },
            {
                // ref 9
                title:'Remove Indicator',
                run: function(){
                    assets.chart.removeSerie('SERIE_INDICATOR_ID');
                }
            },
            {
                // ref 9
                title:'Clear Graphs',
                run: function(){
                    assets.chart.clearGraphs();
                }
            },
            assets.getStandardChartTest('Create Chart'),
            {
                // ref 6
                title:'Add Grapp',
                run: function(){
                    assets.chart.addGraph(assets.graphs.get({
                        graphId:'SUBGRAPH',
                        type:'single',
                        series:assets.series.get({
                            type:'redline',
                            serieId:'SUBSERIE',
                            data:assets.data.get('timestamped_plots', [0,0.5])
                        })

                    })[0]);
                }
            },
            {
                // ref 9
                title:'Clear Both Graphs',
                run: function(){
                    assets.chart.clearGraphs();
                }
            }
        ]
    };
});
