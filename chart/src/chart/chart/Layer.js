define([
    'common/Utilities',
    './ChartType'
], function(utilities, ChartType){

    return function(chart, engine, graph, yScaleGroup, serie, settings) {
        var self = this;

        this._settings = settings;

        console.error('NEW LAYER', settings);

        if (settings.isSelected) {
            if (chart._selectedSerie) {
                chart.clearSelection(true);
            }
            chart._selectedSerie = serie;
        }

        this.isSelected = utilities.settingProperty(settings, "isSelected", function isSelected (newValue, oldValue) {
            console.log('isSelected', graph._settings.id);
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
        
        this.chartType = utilities.settingPropertyProxy(settings, "chartType", function chartType (newChartType, oldChartType) {
            //console.log('set chart type');
            engine.changeChartType(graph._settings.id, yScaleGroup._settings.id, serie._settings.id, self._settings.id, newChartType);
            engine.render();

        }, function (setting) {
            //console.log('new chart type');
            return new ChartType(chart, setting);
        }, false);
    };
});
