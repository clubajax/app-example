define([
    'common/Utilities'
], function(utilities){
    return function(chart, chartEngine, graph, settings) {
        //console.log('header settings', settings);
        this._settings = settings;
        var owner = graph;
        this.domElement = utilities.settingProperty(settings, "domElement", function (newValue) {
            chartEngine.changeHeaderElement(owner._settings.id, newValue);
        });

        this.onRectChanged = utilities.settingProperty(settings, "onRectChanged", function (newValue) {
            chartEngine.onHeaderRectChanged(owner._settings.id, newValue);
        });

        this.height = utilities.settingProperty(settings, "height", function (newValue) {
            chartEngine.changeHeaderHeight(owner._settings.id, newValue);
            chartEngine.getSubGraphById(owner._settings.id).render();
        });

        this.getSettings = function () {
            return utilities.retrieveSettings(settings);
        };

    };
});
