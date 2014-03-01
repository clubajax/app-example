define([
    'common/Utilities',
    './ChartType'
], function(utilities, ChartType){

    return function(chart, engine, graph, yScaleGroup, serie, settings) {
        var self = this;

        this._settings = settings;

        console.log('NEW LAYER', graph._settings);

        if (settings.isSelected) {
            if (chart._selectedSerie) {
                chart.clearSelection(true);
            }
            chart._selectedSerie = serie;
        }

        this.isSelected = utilities.settingProperty(settings, "isSelected", function (newValue, oldValue) {
            if (chart._selectedSerie) {
                chart.clearSelection(true);
            }
            if (newValue) {
                chart._selectedSerie = serie;
            } else {
                if (oldValue) {
                    chart._selectedSerie = undefined;
                }
            }
            engine.selectLayer(graph._settings.id, yScaleGroup._settings.id, serie._settings.id, self._settings.id, newValue);
        });
        
        this.chartType = utilities.settingPropertyProxy(settings, "chartType", function (newChartType, oldChartType) {
            engine.changeChartType(graph._settings.id, yScaleGroup._settings.id, serie._settings.id, self._settings.id, newChartType);
            engine.render();

        }, function (setting) {
            return new ChartType(chart, engine, graph, yScaleGroup, serie, self, setting);
        }, false);
    };
});
