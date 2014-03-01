define([
    'common/Utilities',
    '../defaults'
], function(utilities, defaults){
    //console.log('defaults', defaults);
    
    var Style = function(settings){

    };

    return Style;

    //return function (chart, chartEngine, settings) {
    //    console.log('SETTING', settings);
    //    settings.backgroundColor = settings.backgroundColor || defaults.chart.backgroundColor;
    //    settings.axes = settings.axes || defaults.axes;
    //    settings.label = settings.label || defaults.label;
    //    settings.grid = settings.grid || defaults.grid;
    //
    //    this.getSettings = function () {
    //        return utilities.retrieveSettings(settings);
    //    };
    //
    //    this.axes = utilities.settingProperty(settings, "axes", function (newValue) {
    //        chartEngine.onChartAxesStyleChanged(newValue);
    //    });
    //
    //    this.backgroundColor = utilities.settingProperty(settings, "backgroundColor", function (newValue) {
    //        chartEngine.onChartBackgroundColorChanged(newValue);
    //    });
    //
    //
    //    this.label = utilities.settingProperty(settings, "label", function (newValue) {
    //        chartEngine.onChartLabelStyleChanged(newValue);
    //    });
    //
    //    this.grid = utilities.settingProperty(settings, "grid", function (newValue) {
    //        chartEngine.onChartGridStyleChanged(newValue);
    //    });
    //
    //    window.style = this;
    //};
});

//window.style.backgroundColor(window.style.getSettings(), );
