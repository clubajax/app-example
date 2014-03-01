define([
    'common/Utilities',
    '../group/YScaleGroup'
], function(utilities, YScaleGroup){
    return function(chart, chartEngine, graph, settings) {

        var self = this;

        YScaleGroup.call(this, chart, chartEngine, graph, settings);

        this.position = utilities.settingProperty(settings, "position", function (newValue) {
            //YScaleGroup id, newValue
            chartEngine.changeAxisPosition(graph._settings.id, self._settings.id, newValue);
            chartEngine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
        });

        this.showLabels = utilities.settingProperty(settings, "showLabels", function (newValue) {
            //YScaleGroup id, newValue
            chartEngine.showYAxisLabels(graph._settings.id, self._settings.id, newValue);
            chartEngine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
        });

        this.getSettings = function () {
            return utilities.retrieveSettings(settings);
        };

        this.showHorizontalLines = utilities.settingProperty(settings, "showHorizontalLines", function (newValue) {
            //YScaleGroup id, newValue
            chartEngine.showYAxisLines(graph._settings.id, self._settings.id, newValue);
            chartEngine.getYScaleGroupById(graph._settings.id, self._settings.id).render();
        });
    };
});
