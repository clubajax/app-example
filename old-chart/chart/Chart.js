define([
    'dcl/dcl',
    'jquery',
    'localLib/Evented',
    'common/Utilities',
    './Settings',
    './Axis',
    './XAxis',
    './Graph',
    './Engine',
    'localLib/logger'
], function (dcl, $, Evented, utilities, Settings, Axis, XAxis, Graph, Engine, logger) {

    var
        loggingEnabled = 0,
        log = logger('C', loggingEnabled, 'Chart');

    return dcl(Evented, {

        declaredClass:'Chart',
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


            engine = this.engine = new Engine($parent, settings, this);

            this.graphs = utilities.settingArrayPropertyProxy(
                settings.graphs,
                this.addGraph.bind(this),
                this.updateGraph.bind(this),
                this.removeGraph.bind(this),
                this.clearGraphs.bind(this),
                this.createGraph.bind(this),
                false
            );

            this.xAxis = utilities.settingPropertyProxy(settings, "xAxis", function (newXAxis, oldXAxis) {
                //engine.setXAxis(newXAxis, oldXAxis);
                //newXAxis._init();
                log('xAxis loaded');
            }, function (newXAxisSettings) {
                log('update xAxis', newXAxisSettings);
                return new XAxis(self, engine, newXAxisSettings);
            }, false);
            
            engine.render();
        },

        setTheme: function(theme){
            this.settings.setTheme(theme);
            this.engine.render();
        },

        userInteractionType: function () {
            return this.settings.userInteractionType;
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

        addGraph: function (index, newGraph) {
            //console.log('ADD GRAPH', index, newGraph);
            var
                currentLimits = this.engine.getActualLimits(),
                newLimits;
            log('add graph');
            this.engine.addGraph(newGraph, index);
            //refresh range

            this.engine.setLimits(this.xAxis().limits());
            newLimits = this.engine.getActualLimits();
            if (!currentLimits || !newLimits ||
                (currentLimits.minValueIndex !== newLimits.minValueIndex || currentLimits.maxValueIndex !== newLimits.maxValueIndex)) {
                this.engine.calculateGraphLimitsById(newGraph._settings.id);
            }

            //render
            this.engine.distributeGraphs(this.graphs());
            this.engine.render();
            return newGraph;
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

        removeGraph: function (index, removed) {
            var
                lostIndexedDataPoint = this.engine.removeGraphs(index, removed),
                sgLength,
                aLength,
                srLength,
                i, j, k, axes, series,
                selectedSerie = this._selectedSerie;

            if (!lostIndexedDataPoint) {
                //refresh range
                this.engine.setLimits(this.xAxis().limits());
            } else {
                this.engine.calculateChartLimits();
            }

            this.engine.distributeGraphs(this.graphs());
            this.engine.render();

            if (selectedSerie) {
                sgLength = removed.length;

                // TODO! Fix this rat's nest
                for (i = 0; i < sgLength; i++) {
                    axes = removed[i].axes();
                    this.aLength = axes.length;

                    for (j = 0; j < aLength; j++) {
                        series = axes[j].series();
                        srLength = series.length;

                        for (k = 0; k < srLength; k++) {
                            if (series[k].id === selectedSerie.id) {
                                this._selectedSerie = null;
                                return;
                            }
                        }
                    }
                }
            }
        },

        clearGraphs: function () {
            console.log('CLEAR GRAPHS');
            this.engine.clearGraphs();
            this.engine.setLimits(this.xAxis().limits());
            //render
            this.engine.distributeGraphs(this.graphs()); // huh?
            this.engine.render();
        },

        createGraph: function (setting) {
            return new Graph(this, this.engine, setting);
        },



        $chartElement: function () {
            return this.engine.renderer._$domElement;
        },

        clearSelection: function (silent) {
            var layers, length, i;

            if (this._selectedSerie) {

                if (this._selectedSerie.layers) {
                    layers = this._selectedSerie.layers();
                    length = layers.length;

                    for (i = 0; i < length; i++) {
                        if (layers[i]._settings.isSelected) {
                            layers[i].isSelected(false);
                        }
                    }
                }

                this._selectedSerie = null;

            }
        },

        onEventCallback: function () {
            return this.settings.onEventCallback.apply(null, arguments);
        },

        getSelectedSerie: function () {
            return this._selectedSerie;
        },

        distributeGraphs: function (graphPercentages) {
            var
                i,
                graphs = this.settings.graphs,
                length = graphs.length;

            if (graphPercentages.length !== length) {
                throw new Error('new percentages length must match the number of graphs');
            }
            if (graphPercentages) {
                for (i = 0; i < length; i++) {
                    graphs[i].realEstatePercentage = graphPercentages[i];
                }
                graphPercentages = this.engine.setGraphPercentages(graphPercentages, true);
            }
            this.engine.render();
            return graphPercentages;
        },

        getTimeStampByPosition: function (index) {
            return this.engine.getTimeStampByPosition(index);
        },

        eventInspect: function (x, y) {
            return this.engine.eventInspect(this, x, y);
        },

        triggerGesture: function (type, data) {
            this.engine.triggerGesture(type, data);
        },

        getPositionByTimeStamp: function (timeStamp) {
            return this.engine.getPositionByTimeStamp(timeStamp);
        },
        
        resize: function () {
            this.engine.resize();
        },

        dispose: function () {
            this.engine.dispose();
            this.settings.dispose();
        }
    });
});
