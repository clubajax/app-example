define([], function () {

    function AutoSnapObject() {

    }

    AutoSnapObject.prototype = {
        computeSnapValues: function (snapDataRepository, x, y, data, barSlotCenter, sensibility) {

            sensibility = sensibility || defaultAutoSnapSensibility;

            var distanceX, distanceY, axes = data.axes, aLength = axes.length, series, sLength, layers, lLength, values, vLength, j, k, t, i;

            for (i = 0; i < aLength; i++) {
                series = axes[i].series;
                sLength = series.length;

                for (j = 0; j < sLength; j++) {

                    if (series[j].layers) {
                        layers = series[j].layers;
                        lLength = layers.length;

                        for (k = 0; k < lLength; k++) {
                            values = layers[k];
                            vLength = values.length;

                            for (t = 0; t < vLength; t++) {

                                distanceY = Math.abs(y - values[t].y);

                                if (distanceY < sensibility) {

                                    distanceX = Math.abs(x - barSlotCenter);

                                    if (distanceX < sensibility) {

                                        snapDataRepository.push({
                                            axisIndex: i,
                                            serieIndex: j,
                                            layerIndex: k,
                                            valueIndex: t,
                                            distanceX: distanceX,
                                            distanceY: distanceY,
                                            price: values[t].value
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (snapDataRepository.length > 1) {
                snapDataRepository.sort(function (a, b) { return a.distanceY - b.distanceY; });
            }

        }
    };

    AutoSnapObject.prototype.constructor = AutoSnapObject;

    var defaultAutoSnapSensibility = 6;

    return AutoSnapObject;
});
