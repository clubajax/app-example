define([
    'common/Utilities',
    '../chart/Layer'
], function(utilities, Layer){
    //use cases
    //        0- data();
    //        1- data([]);
    //        2- data([data1, data2]);
    //        3- data(4);
    //        4- data.length();
    //        5- data.add(datax);
    //        6- data.removeAt(index);
    //        7- data.remove({ timeStamp: xx });

    function DataManager(chart, engine, graph, yScaleGroup, owner, settings, propertyName) {
        if (!settings || !propertyName) {
            throw new Error('invalid storage');
        }
        var value = function (newValue) {
            //UC 0
            if (!arguments.length || newValue === undefined) {
                return settings[propertyName];
            } else {
                //UC 1, 2
                if (newValue === null) {
                    newValue = [];
                }
                if (newValue.splice) {
                    if (settings[propertyName]) {
                        var removed = settings[propertyName].splice(0, settings[propertyName].length);
                        engine.removeData(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, removed);
                        //utilities.pushArray(settings[propertyName], newValue);
                        newValue.push(settings[propertyName]);
                    } else {
                        settings[propertyName] = newValue;
                    }
                    engine.addDataRange(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, settings[propertyName], true);
                    engine.render();
                } else {
                    //UC 3
                    return settings[propertyName][newValue];
                }

                return newValue;
            }
        };
        return value;
    }

    function getDataContainer(chart, engine, graph, yScaleGroup, owner, settings, propertyName) {

        var property = new DataManager(chart, engine, graph, yScaleGroup, owner, settings, propertyName);
        property.length = function () {
            return settings[propertyName] && settings[propertyName].length;
        };

        property.add = function (newValue) {
            var data = settings[propertyName], dataLength = settings[propertyName] && settings[propertyName].length,
                result;
            //add to storage with btree
            if (dataLength) {
                result = utilities.binarySet(data, newValue, utilities.timeStampedObjectComparator);
            } else {
                result = data || [];
                settings[propertyName] = data;
                data.push(newValue);
                result.index = 0;
            }
            //if (result.found) {
            //    engine.updateDataValue(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, data[result.index], result.index);
            //} else {
                engine.addData(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, data[result.index], result.index, result.found);
            //}
            return result;
        };

        property.removeAt = function (index, count) {
            if (settings[propertyName]) {
                //remove from the storage
                var removed = settings[propertyName].splice(index, count);
                //notify the engine about the change
                engine.removeData(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, removed);

                engine.render();
            }
        };

        property._init = function () {
            //settings[propertyName].tag = 1;
            engine.addDataRange(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, settings[propertyName]);
        };
        return property;
    }

    return function(chart, engine, graph, yScaleGroup, settings) {
        var self = this;
        self._settings = settings;

        this.layers = utilities.settingArrayPropertyProxy(settings.layers,
            function (index, newLayer) {
                var result = engine.addLayer(graph._settings.id, yScaleGroup._settings.id, self._settings.id, newLayer, index);
                engine.render();
                return result;
            },
            function (index, newLayer, oldLayer) {
                engine.updateLayer(graph._settings.id, yScaleGroup._settings.id, self._settings.id, newLayer, oldLayer, index);
                engine.render();
            },
            function (index, layers) {
                console.log('remove layer:', graph._settings.id);
                engine.removeLayer(graph._settings.id, yScaleGroup._settings.id, self._settings.id, index, layers);
                engine.render();
            },
            function () {
                engine.clearLayers(graph._settings.id, yScaleGroup._settings.id, self._settings.id);
                engine.render();
            },
            function (setting) {
                console.log('adding layer', graph._settings.id);
                return new Layer(chart, engine, graph, yScaleGroup, self, setting);
            },
        false);

        this.inputs = utilities.settingProperty(settings, 'inputs', function (newInputs) {
            engine.setInputs(graph._settings.id, yScaleGroup._settings.id, self._settings.id, newInputs);
        });

        this.getSettings = function () {
            return utilities.retrieveSettings(settings);
        };

        this.dataInspect = function (timeStamp) {
            return engine.dataInspectBySerie(graph._settings.id, yScaleGroup._settings.id, self._settings.id, timeStamp);
        };

        settings.definesScaling = settings.definesScaling === undefined || settings.definesScaling;


        this.data = getDataContainer(chart, engine, graph, yScaleGroup, self, settings, 'data');
    };
});
