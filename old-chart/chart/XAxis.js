define([
    'dcl/dcl',
    'common/Utilities',
    'localLib/logger'
], function(dcl, utilities, logger){

    var log = logger('XA', 0, 'Chart xAxis');
    
    return dcl(null, {
        declaredClass:'XAxis',
        constructor: function(chart, engine, settings){

            settings.showLabels = settings.showLabels === undefined ? true : settings.showLabels;
            settings.showVerticalLines = settings.showVerticalLines === undefined ? true : settings.showVerticalLines;
            settings.limits = settings.limits === undefined ? 'auto' : settings.limits;
            settings.maximumNumberOfVisibleBars = settings.maximumNumberOfVisibleBars === undefined ? 60 : settings.maximumNumberOfVisibleBars;
            settings.minimumNumberOfVisibleBars = settings.minimumNumberOfVisibleBars === undefined ? 5 : settings.minimumNumberOfVisibleBars;
            this.settings = settings;
            this.engine = engine;

            this.maximumNumberOfVisibleBars = utilities.settingProperty(settings, "maximumNumberOfVisibleBars", function (newValue) {
                engine.setMaxViewPortSize(newValue);
                engine.render();
            });

            this.minimumNumberOfVisibleBars = utilities.settingProperty(settings, "minimumNumberOfVisibleBars", function (newValue) {
                engine.setMinViewPortSize(newValue);
                engine.render();
            });

            this.showVerticalLines = utilities.settingProperty(settings, "showVerticalLines", function (newValue) {
                engine.onXAxisShowGridChange(newValue);
            });


            this.showLabels = utilities.settingProperty(settings, "showLabels", function (newValue) {
                engine.onXAxisShowLabelsChange(engine, newValue);
            });

            this.onLimitsChanged = utilities.settingProperty(settings, "onLimitsChanged", function(newValue) {
                log('onLimitsChanged', newValue);
                engine.onLimitsChanged = newValue;
            });

            function getLimits() {
                return settings.limits;
            }

            function setLimits(newLimits, silent) {
                //log('setLimits', newLimits, silent);
                var oldLimits = engine.getActualLimits(),
                    oldWidth = oldLimits && (oldLimits.maxValueIndex - oldLimits.minValueIndex),
                    newWidth = newLimits.maxValueIndex - newLimits.minValueIndex;
                settings.limits = engine.setLimits(newLimits);
                if (!silent) {
                    if (oldWidth !== newWidth) {
                        engine.render();
                    } else {
                        engine.scroll();
                    }
                }
                return settings.limits;
            }

            this.limits = utilities.property({
                owner: settings.limits,
                get: getLimits,
                set: setLimits
            });

        },

        getActualLimits: function () {
            return this.engine.getActualLimits();
        },

        getSettings: function () {
            return utilities.retrieveSettings(this.settings);
        },

        totalRangeMax: function () {
            return this.engine.indexedData.data.length - 1;
        }
    });
});
