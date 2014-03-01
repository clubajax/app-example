define([
    'common/Utilities',
    './Header',
    './Axis',
    'localLib/logger'
], function(utilities, Header, Axis, logger){

    var log = logger('G', 1, 'Graph');

    return function(chart, engine, settings) {
        this.IS_PROXY_OBJECT = 1;
        this._settings = settings;
        var self = this;

        if(settings.header){
            this.header = utilities.settingPropertyProxy(settings, "header", function (newHeader, oldHeader) {
                    engine.setHeader(self._settings.id, newHeader);
                }, function (headerSettings) {
                    return new Header(chart, engine, self, headerSettings);
                }, false);
        }


        settings.minDataHeight = settings.minDataHeight || 10;

        this.minDataHeight = utilities.settingProperty(settings, 'minDataHeight', function (newValue) {
            return engine.changeMinDataHeight(self._settings.id, newValue);
        });

        this.getRect = function () {
            return engine.getGraphRect(self._settings.id);
        };

        this.realEstatePercentage = utilities.settingProperty(settings, "realEstatePercentage", function (newValue) {
            engine.distributeGraphs(chart.graphs());
            engine.render();
        });

        this.onRealEstatePercentageChanged = utilities.settingProperty(settings, "onRealEstatePercentageChanged", function (newValue) {
            engine.onRealEstatePercentageChanged(self._settings.id, newValue);
        });

        this.hitTest = function (x, y) {
            return engine.hitTest(self._settings.id, x, y);
        };

        this.dataInspect = function (timeStamp) {
            return engine.dataInspect(self._settings.id, timeStamp);
        };

        this.onDrop = function (target) {
            engine.onDrop(self._settings.id, target);
        };

        this.onDragEnter = function (target) {
            console.log('DRAG');
            engine.onDragEnter(self._settings.id, target);
        };

        this.onDragLeave = function (target) {
            engine.onDragLeave(self._settings.id, target);
        };

        this.onDragOver = function (target) {
            engine.onDragOver(self._settings.id, target);
        };

        this.showCrosshair = function (x, y) {
            engine.showCrosshair(self._settings.id, x, y);
        };
        this.hideCrosshair = function () {
            engine.hideCrosshair();
        };

        this.getSettings = function () {
            return utilities.retrieveSettings(settings);
        };

        this.axes = utilities.settingArrayPropertyProxy(settings.axes,
            function (index, axis) {
                var
                    currentLimits = engine.getActualLimits(),
                    newLimits;
                    
                log('------------- addAxis', index, axis);

                engine.addScaleGroup(self._settings.id, axis, index);
                newLimits = engine.getActualLimits();
                if (!currentLimits || !newLimits || (currentLimits.minValueIndex !== newLimits.minValueIndex || currentLimits.maxValueIndex !== newLimits.maxValueIndex)) {
                    log('    calc yScale');
                    engine.calculateYScaleLimitsById(self._settings.id, axis._settings.id);
                }
                log('    newLimits', newLimits);
                engine.render();
                //doesn't work if it is the first time...
                //engine.getYScaleGroupById(self._settings.id, axis._settings.id).render();
            },
            function (index, axis) {
                log('------------- update axis');
                engine.updateScaleGroup(self._settings.id, index, axis);
                engine.getSubGraphById(self._settings.id).render();
            },
            function (index, axis) {
                log('------------- remove axis', index, axis);
                var lostIndexedDataPoint = engine.removeScaleGroup(self._settings.id, index, axis);
                if (lostIndexedDataPoint) {
                    engine.calculateChartLimits();
                    engine.render();
                } else {
                    engine.getSubGraphById(self._settings.id).render();
                }
            },
            function (axes) {
                log('\n\n\n------------- clearScaleGroups for new symbol');
                engine.clearScaleGroups(self._settings.id);
                engine.render();
            },
            function (setting) {
                log('-------------create axis', setting);
                //setting.id = utilities.idGenerator();
                return new Axis(chart, engine, self, setting);
            }, false);
    };
});
