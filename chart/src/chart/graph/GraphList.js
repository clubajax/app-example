define([
    'dcl/dcl',
    './Graph',
    'common/Base',
    'common/Rect',
    'common/Utilities'
], function(dcl, Graph, Base, rect, utilities){

    var
        GraphList,
        events = {
            added:'added',
            removed:'removed'
        };

    GraphList = dcl(Base, {
        declaredClass:'GraphList',
        eventTree:null,
        renderer:null,
        initialGraphs: null,
        indexedData: null,
        painterFactory: null,
        leftAxisWidth: 0,
        rightAxisWidth: 0,
        rect: null,
        theme:null,

        length:0,

        constructor: function(settings, node){
            this.domNode = node;
            this.map = {};
            this.list = [];
            this.rect = rect();
            
            this.initialGraphs = Array.isArray(this.initialGraphs) ? this.initialGraphs : this.initialGraphs ? [this.initialGraphs] : [];
            this.initialGraphs.forEach(function(settings){
                this.add(settings);
            }, this);

        },

        getGroup: function(groupId){
            var i, group;
            for(i = 0; i < this.list.length; i++){
                group = this.list[i].groups.get(groupId);
                if(group){
                    return group;
                }
            }
            return null;
        },

        getSerie: function(serieId){
            var i, serie;
            for(i = 0; i < this.list.length; i++){
                serie = this.list[i].groups.getSerie(serieId);
                if(serie){
                    return serie;
                }
            }
            return null;
        },

        removeSerie: function(serieId){
            var i, serie;
            for(i = 0; i < this.list.length; i++){
                serie = this.list[i].groups.getSerie(serieId);
                if(serie){
                    return this.list[i].groups.removeSerie(serieId);
                }
            }
            return false;
        },

        add: function(settings, index){
            if(Array.isArray(settings)){
                settings.forEach(this.add, this);
                return null;
            }

            if(index !== undefined){
                console.warn('add graph with index not yet supported');
            }

            var
                graph = new Graph(this.domNode, utilities.mixin(false, settings, {
                    eventTree: this.eventTree.child(),
                    indexedData: this.indexedData,
                    painterFactory: this.painterFactory,
                    leftAxisWidth: this.leftYAxisWidth,
                    rightAxisWidth: this.rightYAxisWidth,
                    rect: {
                        top:this.rect.top,
                        bottom:this.rect.bottom,
                        left:this.rect.left,
                        right:this.rect.right
                    },
                    theme:this.theme
                }));
                
            this.map[graph.id] = graph;
            this.list.push(graph);
            this.length = this.list.length;
            
            this.eventTree.emit(this.eventTree.events.addGraph, {graph:graph});
            return graph;
        },

        remove: function(identifier){
            if(!identifier){
                return;
            }
            var
                graph = this.get(identifier);

            console.log('EMIT REMOVE');
            this.eventTree.emit(this.eventTree.events.beforeRemoveGraph, {graph:graph});
            delete this.map[graph.id];
            this.list.splice(this.getIndex(graph.id), 1);
            graph.dispose();
            this.eventTree.emit(this.eventTree.events.removeGraph, {graph:graph});
            this.length = this.list.length;
        },

        clear: function(removedObjects){
            var graph, graphs = this.get();
            console.log('clear ', graphs.length);
            while(graphs.length){
                graph = graphs[graphs.length - 1];

                this.remove(graph);
                console.log('cleared, ', graphs.length);
            }
            
            if (this.xAxis) {
                this.xAxis.render();
            }
        },

        distributeGraphs: function () {
            var
                graphs = this.get(),
                length = graphs.length,
                i,
                realEstatePercent,
                accum = 0,
                chartPercents = [];

            for (i = 0; i < length; i++) {
                realEstatePercent = graphs[i].realEstatePercentage();
                //
                // TODO
                // Why does the main graph change to 100 after removing a subgraph?
                realEstatePercent = realEstatePercent > 1 ? 1 : realEstatePercent;
                chartPercents[i] = realEstatePercent;
                accum += realEstatePercent;
            }

            return this.setGraphPercentages(chartPercents, accum !== 1);
        },

        setGraphPercentages: function (percentages, normalize) {
            var
                length = percentages.length,
                i,
                realEstatePercent,
                accum = 0,
                contribution,
                chartPercents = normalize ? [] : percentages;

            if (normalize) {
                contribution = [];
                for (i = 0; i < length; i++) {
                    realEstatePercent = percentages[i];
                    contribution[i] = realEstatePercent;
                    accum += realEstatePercent;
                }
                for (i = 0; i < length; i++) {
                    chartPercents[i] = 100 * contribution[i] / accum;
                }
            }

            //this.renderer.subGraphSizeChanged(chartPercents);

            return chartPercents;
        },
    });

    GraphList.events = events;
    return GraphList;
});
