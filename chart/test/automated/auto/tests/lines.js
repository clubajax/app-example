define(['auto/assets'], function(assets){
    return {
        suite:'Lines',
        tests:[
            assets.getStandardChartTest('Create Chart with Half Data'),
            {
                // ref 10
                skip:0,
                title:'Add Drawing: Vertical Red Line',
                run: function(){
                    var
                        serie = {
                            id:'DRAW_RED',
                            definesScaling: false,
                            inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 5, 9, 37, 0, 0), price: null } }],
                            data: [],
                            layers: [{
                                id:'LAYER_DYN',
                                isSelected: false,
                                chartType: {
                                    name: "verticalLine",
                                    settings: {
                                        lineStyle:'red'
                                    }
                                }
                            }]
                        },
                        groupId = assets.chart.graphs(0).groups.get(0).id,
                        graphId = assets.chart.graphs(0).id;

                    assets.chart.addSerie(graphId, groupId, serie, 1);
                }
            },
            {
                // ref 11
                title:'Add Drawing: Horizontal Green Line',
                run: function(){
                    var serie = {
                        id:'DRAW_GREEN',
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: null, price: 13.53 } }],
                        data: [],
                        layers: [{
                            id:'LAYER_GREEN',
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    lineStyle:'green'
                                }
                            }
                        }]
                    },
                    groupId = assets.chart.graphs(0).groups.get(0).id,
                    graphId = assets.chart.graphs(0).id;

                    assets.chart.addSerie(graphId, groupId, serie, 1);
                }
            },
            {
                // ref 12
                title:'Add Drawing: Trend Ray Orange',
                run: function(){
                    var serie = {
                        id:'DRAW_ORANGE',
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 2, 9, 37, 0, 0), price: 14.70 } },
                                 { name: 'point2', value: { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), price: 13.50 } }],
                        data: [],
                        layers: [{
                            id:'LAYER_ORANGE',
                            isSelected: false,
                            chartType: {
                                name: "trendRay",
                                settings: {
                                    lineStyle:'orange'
                                }
                            }
                        }]
                    },
                    groupId = assets.chart.graphs(0).groups.get(0).id,
                    graphId = assets.chart.graphs(0).id;

                    assets.chart.addSerie(graphId, groupId, serie, 1);
                }
            },
            {
                // ref 13
                title:'Add Selection Plugin (no visual)',
                run: function(){
                    assets.plugins.selection();
                }
            },
            {
                // ref 14
                title:'Select Orange Line (programmatic)',
                run: function(){
                    assets.chart.select('LAYER_ORANGE');
                }
            },
            {
                // ref 15
                title:'Deselect Orange Line (programmatic)',
                run: function(){
                    assets.chart.select('LAYER_ORANGE', false);
                }
            },
            {
                // ref 14
                title:'Select Orange Line (again)',
                run: function(){
                    assets.chart.select('LAYER_ORANGE');
                }
            },
            {
                // ref 14
                title:'Deselect All',
                run: function(){
                    assets.chart.clearSelection();
                }
            },
            {
                // ref 14
                title:'Select Green Line (programmatic)',
                run: function(){
                    assets.chart.select('DRAW_GREEN');
                }
            },{
                title:'Delete Green Line',
                run: function(){
                    assets.chart.removeSerie('LAYER_GREEN');
                }
            },


            {
                title:'Add Drawing Plugin (no visible change)',
                run: function(){
                    assets.plugins.drawing();
                }
            },
            {
                title:'Add Orange Line Drawing Template (no visible change)',
                run: function(){
                   assets.broker.get('drawing').template({
                        inputAmount:2,
                        layers: [{
                            chartType: {
                                name: assets.chart.chartTypes.trendLine,
                                settings: {
                                    lineStyle:'orange'
                                }
                            }
                        }]
                    });
                }
            },{
                title:'Draw Orange Line with Mouse Events',
                end:1,
                run: function(){
                    assets.mouse(this, 30, 100, 100, 5, 50);
                }
            }
        ]
    };
});
