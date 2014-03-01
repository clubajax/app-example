define([
    'dcl/dcl',
    'jquery',
    'localLib/Evented',
    'common/EventTree',
    'common/Utilities',
    'common/ChartTypes',
    './changeChartType',
    './Settings',
    './EventHandler',
    './XAxis',
    './Engine',
    'localLib/logger'
], function (dcl, $, Evented, EventTree, utilities, chartTypes, changeChartType, Settings, EventHandler, XAxis, Engine, logger) {

    var
        loggingEnabled = 0,
        log = logger('C', loggingEnabled, 'Chart');

    return dcl(Evented, {

        declaredClass:'Chart',
        events:{
            // woefully not updated
            loaded:'loaded',
            unloaded:'unloaded',
            limits:'limits',
            error:'error',

            chartType:'chart-type',
            dataPoint:'data-point',
            data:'data',
            updateGroup:'update-group',
            addGroup:'add-group',
            addGraph:'add-graph',
            removeGraph:'remove-graph',
            removeSerie:'remove-serie',
            addSerie:'add-serie',
            selected:'selected',
            addSection:'add-section',
            beforeRemoveGraph:'before-remove-graph'
        },
        chartTypes:chartTypes,
        constructor: function(parent, settings){
            log('Chart loaded');
            if(loggingEnabled){
                window.chart = this;
            }

            var $parent = $(parent || document.body),
                self = this,
                engine;

            settings = this.settings = new Settings(settings, $parent);
            
            this.resourceManager = settings.resourceManager; //utilities.settingProperty(settings, "resourceManager");
            
            this.onViewPortLeftMarginChange = utilities.settingProperty(settings, "onViewPortLeftMarginChange", function (newValue) {
                engine.setOnViewPortLeftMarginChange(newValue);
            });

            this.onViewPortRightMarginChange = utilities.settingProperty(settings, "onViewPortRightMarginChange", function (newValue) {
                engine.setOnViewPortRightMarginChange(newValue);
            });

            settings.eventTree = new EventTree({events:this.events});


            settings.eventTree.on(settings.eventTree.events.removeSerie, function(id){
                if(this._selectedSerie && this._selectedSerie.id === id){
                    this._selectedSerie = null;
                }
            }, this);

            engine = this.engine = new Engine($parent, settings, this);


            settings.eventTree.on(settings.eventTree.events.selected, function(event){
                if(event.section.isSelected()){
                    this._selectedSerie = event.serie;
                }else{
                    this._selectedSerie = null;
                }
            }, this);

            this.graphs = function(identifier){
                return this.engine.renderer.graphs.get(identifier);
            };

            // used by Horz Scrollbar
            this.xAxis = utilities.settingPropertyProxy(settings, "xAxis", function (newXAxis, oldXAxis) {
                //engine.setXAxis(newXAxis, oldXAxis);
                //newXAxis._init();
                log('xAxis loaded');
            }, function (newXAxisSettings) {
                log('update xAxis', newXAxisSettings);
                return new XAxis(self, engine, newXAxisSettings);
            }, false);
            
            engine.render();

            this.mouseEventHandler = new EventHandler(this);
            this.eventInspect = this.mouseEventHandler.eventInspect.bind(this.mouseEventHandler);
            this.mouseControl = this.mouseEventHandler.controls;

            // initialize graphs
            this.engine.renderer.graphs.add(settings.graphs);
        },





        getChain: function(id){
            return this.engine.renderer.graphs.getChain(id);
        },

        getGraph: function(id){
            if(id === undefined || id === 'default'){
                return this.engine.renderer.graphs.get(0);
            }
            return this.getChain(id).graph;
        },

        getSerie: function(id){
            if(id === undefined || id === 'default'){
                return this.engine.renderer.graphs.get(0).groups.get(0).series.get(0);
            }
            return this.getChain(id).serie;
        },

        getSection: function(id){
            if(id === undefined || id === 'default'){
                return this.engine.renderer.graphs.get(0).groups.get(0).series.get(0).sections.get(0);
            }
            return this.getChain(id).serie;
        },





        select: function(layerId, deselect){
            var
                select = deselect === false ? false : true,
                chain = this.getChain(layerId);

            this.clearSelection();
            if(chain.section){
                chain.section.isSelected(select);
            }
        },

        addSerie: function (graphId, yScaleGroupId, serieSettings, index) {
            var serie = this.engine.addSerie(graphId, yScaleGroupId, serieSettings, index);
            this.engine.distributeGraphs(this.graphs());
            this.engine.render();
            return serie;
        },

        removeSerie: function(serieId){
            this.engine.removeSerie(serieId);
        },

        chartType: function(type, serieId, color) {
            changeChartType(this, type, serieId, color);
        },

        setWatermark: function(options){
            this.engine.renderer.setWatermark(options);
        },

        setTheme: function(theme){
            this.settings.setTheme(theme);
            this.engine.render();
        },

        getViewPortLeftMargin: function () {
            // called by plugins
            return this.engine.renderer.subGraphs &&
                    this.engine.renderer.subGraphs().length &&
                    this.engine.renderer.subGraphs(0).settings.leftAxisWidth;
        },

        getViewPortRightMargin: function () {
            return this.engine.renderer.subGraphs &&
                    this.engine.renderer.subGraphs().length &&
                    this.engine.renderer.subGraphs(0).settings.rightAxisWidth;
        },

        addGraph: function (graph, index) {
            return this.engine.renderer.graphs.add(graph, index);
        },

        updateGraph: function (newGraph, oldGraph) {
            var
                result = this.engine.updateGraph(newGraph, oldGraph);
            log('update graph');
            //refresh range
            this.engine.setLimits(this.xAxis().limits());
            //render
            this.engine.distributeGraphs(this.graphs());
            this.engine.render();
            return result;
        },

        removeGraph: function (identifier) {
            return this.engine.renderer.graphs.remove(identifier);
            //var
            //    lostIndexedDataPoint = this.engine.removeGraph(index);
            //
            //if (!lostIndexedDataPoint) {
            //    //refresh range
            //    this.engine.setLimits(this.xAxis().limits());
            //} else {
            //    this.engine.calculateChartLimits();
            //}
            //
            //this.engine.distributeGraphs(this.graphs());
            //this.engine.render();
        },

        clearGraphs: function () {
            console.log('CLEAR GRAPHS');
            this.engine.clearGraphs();
            
        },

        $chartElement: function () {
            return this.engine.renderer._$domElement;
        },

        clearSelection: function () {
            if (this._selectedSerie) {
                this._selectedSerie.isSelected(false);
                this._selectedSerie = null;
            }
        },

        onEventCallback: function (type, event) {
            return this.settings.onEventCallback.apply(null, arguments);
        },

        getSelectedSerie: function () {
            return this._selectedSerie;
        },

        getTimeStampByPosition: function (index) {
            return this.engine.indexedData.getTimeStampByPosition(index);
        },

        eventInspect: function (x, y) {
            return this.engine.eventInspect(x, y);
        },

        triggerGesture: function (type, data) {
            this.engine.triggerGesture(type, data);
        },

        getPositionByTimeStamp: function (timeStamp) {
            return this.engine.indexedData.getPositionByTimeStamp(timeStamp);
        },
        
        resize: function () {
            this.engine.resize();
        },

        dispose: function () {
            this.engine.dispose();
            this.settings.dispose();
            this.mouseEventHandler.dispose();
        }
    });
});
