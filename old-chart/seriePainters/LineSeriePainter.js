define([
    'dcl/dcl',
    'chart/seriePainters/MultiSlotSeriePainter',
    'common/Utilities'
], function(dcl, MultiSlotSeriePainter, utilities){

    return dcl(MultiSlotSeriePainter, {
        declaredClass:'LineSeriePainter',
        constructor: function(){

        },
        _render: function () {
            var
                settings = this.settings,
                printer = settings.printer,
                data = settings.serie.data,
                valueIndex = settings.valueIndexes[0],
                xMinLimit = settings.serie.limits.time.minValueIndex,
                xMaxLimit = settings.serie.limits.time.maxValueIndex,
                squareSide,
                tempColor,
                center,
                maxValue,
                currentLimit,
                viewPortSlot,
                scalarLimits,
                isSelected,
                lastMarkerIndex,
                selectionMarkerDistance,
                halfSelectionMarker,
                selectionMarkers,
                scaler,
                value,
                valueObject,
                strokeStyle = {},
                drawColor = settings.theme.draw.color,
                shape = [],
                color,
                line,
                topLimit,
                bottomLimit;

            if(this.settings.style && this.settings.style.lineStyle){
                drawColor = settings.theme.draw[this.settings.style.lineStyle].color;
            }

            if (xMinLimit === xMaxLimit) {
                // this is a rare case for which I have not tested
                valueObject = data[xMaxLimit];

                if (valueObject.indexedDataPoint.viewPortSlot) {
                    value = valueObject.values[valueIndex];

                    strokeStyle.color = 'rgba(' + (value.color || drawColor) + ', 1)';

                    printer.plotCircles([{
                        x: valueObject.indexedDataPoint.viewPortSlot.center,
                        y: settings.scaler.calculate(value.value),
                        radius: settings.theme.draw.radius
                    }], strokeStyle);
                }

            } else {

                isSelected = settings.isSelected;
                strokeStyle.width = settings.theme.draw.width;
                scalarLimits = settings.scaler.positionLimits();
                bottomLimit = scalarLimits.maxValue;
                topLimit = scalarLimits.minValue;
                scaler = settings.scaler.calculate;

                if (isSelected) {
                    lastMarkerIndex = 0;
                    squareSide = settings.theme.selection.squareSide;
                    viewPortSlot = data[xMinLimit].indexedDataPoint.viewPortSlot;
                    selectionMarkerDistance = this.calculateSelectionDistance(squareSide, viewPortSlot.right - viewPortSlot.left);
                    halfSelectionMarker = squareSide / 2;
                    selectionMarkers = this.selectionMarkers;
                }

                if (xMinLimit > 0) {

                    value = data[xMinLimit - 1];

                    if (value.indexedDataPoint.viewPortSlot) {
                        viewPortSlot = value.indexedDataPoint.viewPortSlot.center;
                    } else {
                        viewPortSlot = (3 * data[xMinLimit].indexedDataPoint.viewPortSlot.center - data[xMinLimit + 1].indexedDataPoint.viewPortSlot.center) / 2;
                    }

                    value = value.values[valueIndex];
                    color = value.color;
                    value = value.value;
                    currentLimit = settings.scaler.valueLimits().maxValue;
                    value = value > currentLimit ? currentLimit : value;

                } else {

                    value = data[0];
                    viewPortSlot = value.indexedDataPoint.viewPortSlot.center;
                    value = value.values[valueIndex];
                    color = value.color;
                    value = value.value;
                    xMinLimit++;
                    lastMarkerIndex++;
                }

                color = color || drawColor;
                value = scaler(value);

                if (value - topLimit < 1) {
                    value += 1.5;
                } else if (bottomLimit - value < 1) {
                    value -= 0.5;
                }

                shape.push({
                    x: Math.floor(viewPortSlot),
                    y: value
                });

                for (currentLimit = xMinLimit; currentLimit <= xMaxLimit; currentLimit++) {

                    tempColor = color;

                    value = data[currentLimit];


                    line = {
                        x: Math.floor(value.indexedDataPoint.viewPortSlot.center)
                    };

                    value = value.values[valueIndex];
                    color = value.color || drawColor;
                    value = scaler(value.value);

                    if (value - topLimit < 1) {
                        value += 1.5;
                    } else if (bottomLimit - value < 1) {
                        value -= 0.5;
                    }

                    line.y = value;

                    shape.push(line);

                    if (tempColor !== color) {
                        strokeStyle.color = 'rgba(' + tempColor + ', 1)';
                        printer.plotOpenShape(shape, strokeStyle, 3);
                        shape.splice(0, shape.length - 1);
                    }

                    if (isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (xMaxLimit - currentLimit) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(line.x - halfSelectionMarker) + 0.5,
                                y: Math.floor(line.y - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }
                }

                if (xMaxLimit < data.length - 1) {

                    value = data[xMaxLimit + 1];

                    if (value.indexedDataPoint.viewPortSlot) {
                        center = value.indexedDataPoint.viewPortSlot.center;
                        value = value.values[valueIndex].value;

                    } else {
                        center = (3 * data[xMaxLimit].indexedDataPoint.viewPortSlot.center - data[xMaxLimit - 1].indexedDataPoint.viewPortSlot.center) / 2;
                        maxValue = settings.scaler.valueLimits().maxValue;
                        value = value.values[valueIndex].value;
                        value = value > maxValue ? maxValue : value;
                    }

                    shape.push({
                        x: Math.floor(center),
                        y: scaler(value)
                    });
                }

                strokeStyle.color = 'rgba(' + color + ', 1)';
                printer.plotOpenShape(shape, strokeStyle, 3);
                shape.length = 0;
                line = null;

                if (isSelected) {
                    this.renderSelection(selectionMarkers);
                    selectionMarkers.length = 0;
                }
            }

            return null; // no hotspots
        },

        dispose: function () {
            MultiSlotSeriePainter.prototype.dispose.call(this);
        }
    });
});
