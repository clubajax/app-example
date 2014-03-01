define([
    'common/Utilities',
    '../serie/Serie'
], function(utilities, Serie){
    return function (chart, engine, graph, settings) {
        this._settings = settings;
        var self = this;


        this.getScaler = function () {
            return engine.getScaler(graph._settings.id, self._settings.id);
        };

        this.getActualLimits = function () {
            return engine.getYScaleActualLimits(graph._settings.id, self._settings.id);
        };

        this.getSettings = function () {
            return utilities.retrieveSettings(settings);
        };
        
        this.scalingType = utilities.settingProperty(settings, "scalingType", function (newValue) {
            //YScaleGroup id, newValue
            engine.setScalingType(graph._settings.id, self._settings.id, newValue);
            engine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
        });


        this.numberFormat = utilities.settingProperty(settings, "numberFormat", function (newValue) {
            //YScaleGroup id, newValue
            var result = engine.setNumberFormat(graph._settings.id, self._settings.id, newValue);
            engine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
            return result;
        });

        this.minMove = utilities.settingProperty(settings, "minMove", function (newValue) {
            //YScaleGroup id, newValue
            var result = engine.setMinMove(graph._settings.id, self._settings.id, newValue);
            engine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
            return result;
        });

        this.limits = utilities.settingProperty(settings, "limits", function (newValue) {
            //YScaleGroup id, newValue
            engine.setYLimits(graph._settings.id, self._settings.id, newValue);
            engine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
        });



        this.series = utilities.settingArrayPropertyProxy(settings.series,
            function (index, serie) {
                engine.addSerie(graph._settings.id, self._settings.id, serie, index);
                engine.render();
            },
            function (index, serie) {
                engine.updateSerie(graph._settings.id, self._settings.id, serie, index);
                //serie._init();
                engine.render();
            },
            function (index, series) {
                var i, length = series.length, lostIndexedDataPoint;
                for (i = 0; i < length; i++) {
                    if (series[i] === chart._selectedSerie) {
                        chart.clearSelection(true);
                        break;
                    }
                }

                lostIndexedDataPoint = engine.removeSeries(graph._settings.id, self._settings.id, index, series);
                if (lostIndexedDataPoint) {
                    engine.calculateChartLimits();
                }
                engine.render();
            },
            function () {
                engine.clearSeries(graph._settings.id, self._settings.id);
                engine.render();
            },
            function (setting) {
                return new Serie(chart, engine, graph, self, setting);
            },
            false);
    };
});
