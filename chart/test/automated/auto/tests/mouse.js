define(['auto/assets'], function(assets){
    return {
        suite:'Mouse',
        tests:[
            assets.getStandardChartTest('Create Chart with Half Data'),
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
                // ref 16
                title:'Add Crosshair Plugin (no visual)',
                run: function(){
                    assets.plugins.crosshair();
                }
            },
            {
                // ref 17
                title:'Mouse Events (down, move, up)',
                end: 1,
                run: function(){
                    //    self, speed, x, y, increment, count
                    assets.mouse(this, 30, 100, 100, 5, 50);
                }
            },
            {
                // ref 18
                title:'Mouse Events - drag outside chart',
                end:1,
                run: function(){
                    assets.mouse(this, 30, 100, 100, 10, 50);
                }
            },
            {
                // ref 19
                title:'Select Bar Graph (mouse click)',
                run: function(){
                    var box = assets.containerNode.getBoundingClientRect();
                    assets.chart.mouseControl.down(box.left + box.width/2, box.top + box.height/2);
                    // comment out up event to see crosshair
                    assets.chart.mouseControl.up(box.left + box.width/2, box.top + box.height/2);
                }
            },
            {
                // ref 20
                title:'Select Green Line (programmatic, should deselect graph)',
                run: function(){
                    assets.chart.select('LAYER_GREEN');
                }
            },

            {
                // ref 21
                title:'Add Datatip Plugin (no visual)',
                run: function(){
                    assets.plugins.datatip();
                }
            },
            {
                // ref 22
                title:'Datatip with Mouse Events',
                end:1,
                run: function(){
                    assets.mouse(this, 30, 100, 100, 2, 100);
                }
            }
        ]
    };
});
