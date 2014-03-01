define([
    'common/Utilities'
], function(utilities){

    function noop () {
        throw new Error ('operation is not supported');
    }

    return function(chart, settings) {
        this._settings = settings;
        this.dataPointDefinitions = utilities.settingArrayPropertyProxy(settings.dataPointDefinitions, noop, noop, noop, noop, null, false); //null=> no transformation required
        //console.log('ChartType', this);
    };
});
