define(['auto/assets'], function(assets){
    return {
        suite:'Chart Type',
        tests:[
            assets.getStandardChartTest('Create Chart with Full Data', assets.data.get('timestamped')),
            {
                // ref 25
                title:'Set Watermark',
                run: function(){
                    assets.chart.setWatermark({
                        symbol:'YHOO',
                        interval:'5 min'
                    });
                }
            },
            {
                // ref 26
                title:'Set Watermark Symbol',
                run: function(){
                    assets.chart.setWatermark({
                        symbol:'GOOG'
                    });
                }
            },
            {
                // ref 27
                title:'Set Watermark Interval',
                run: function(){
                    assets.chart.setWatermark({
                        interval:'Daily'
                    });
                }
            },
            {
                // ref 28
                title:'Chart Type',
                run: function(){
                    assets.chart.setWatermark({
                        interval:'Daily'
                    });
                }
            },
            {
                // ref 29
                title:'Set Theme Light',
                run: function(){
                    assets.chart.setTheme('light');
                }
            },
            {
                // ref 30
                title:'Set Theme Dark',
                run: function(){
                    assets.chart.setTheme('dark');
                }
            },
            {
                // ref 31
                title:'Set Chart Type OHLC',
                run: function(){
                    assets.chart.chartType('ohlc');
                }
            },
            {
                // ref 32
                title:'Set Chart Type Line',
                run: function(){
                    assets.chart.chartType('line');
                }
            },
            {
                // ref 33
                title:'Set Chart Type Candlestick',
                run: function(){
                    assets.chart.chartType('candlestick');
                }
            },
            {
                // ref 34
                title:'Set Candlestick to Monex Colors',
                run: function(){
                    assets.chart.chartType('candlestick', 'default', 'hotcold');
                }
            },
            {
                // ref 35
                title:'Set Chart Type Area',
                run: function(){
                    assets.chart.chartType('area');
                }
            },
            {
                // ref 35
                title:'Set Graph Name to "Custom Graph Name"',
                run: function(){
                    var graph = assets.chart.getGraph('default');
                    graph.headerNode.innerHTML = 'Custom Graph Name';
                }
            }
        ]
    };
});
