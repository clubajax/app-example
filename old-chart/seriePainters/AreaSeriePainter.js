define([
    'dcl/dcl',
    './GradientSeriePainter'
], function(dcl, GradientSeriePainter){

    return dcl(GradientSeriePainter, {
        declaredClass:'AreaSeriePainter',
        constructor: function(){

        },
        _buildStyle: function () {
            var
                grad,
                draw = this.settings.theme.draw;

            if(this.settings.style && this.settings.style.lineStyle){
                draw = draw[this.settings.style.lineStyle];
            }

            this._strokeStyle.width = draw.width;
            this._strokeStyle.color = 'rgba(' + draw.color + ',1)';

            grad = draw.gradient;

            if (this._gradient.length) {
                this._gradient[0].color = 'rgba(' + draw.color + ',' + grad[0].alpha + ')';
                this._gradient[0].offset = grad[0].offset;

                this._gradient[1].color = 'rgba(' + draw.color + ',' + grad[1].alpha + ')';
                this._gradient[1].offset = grad[1].offset;

            } else {

                this._gradient.push({
                    color: 'rgba(' + draw.color + ',' + grad[0].alpha + ')',
                    offset: grad[0].offset
                }, {
                    color: 'rgba(' + draw.color + ',' + grad[1].alpha + ')',
                    offset: grad[1].offset
                });
            }

            if(!this.themeHandle){
                this.themeHandle = this.settings.theme.on('change', '_buildStyle', this);
            }
        },


        _render: function () {

            var
                settings = this.settings,
                data = settings.serie.data,
                shape = [],
                valueIndex = settings.valueIndexes[0],
                scaler = settings.scaler.calculate,
                printer = settings.printer,
                selectionMarkers = this.selectionMarkers,
                gradient = printer.createLinearGradient(0, Math.floor(settings.rect.top), 0, Math.floor(settings.rect.bottom), this._gradient),
                minValueIndex,
                maxValueIndex,
                maxValue,
                viewPortSlot,
                squareSide,
                point,
                value,
                lastMarkerIndex,
                selectionMarkerDistance,
                halfSelectionMarker,
                xValue,
                index,
                p1,
                p2;

            minValueIndex = settings.serie.limits.time.minValueIndex;
            maxValueIndex = settings.serie.limits.time.maxValueIndex;

            if (maxValueIndex === minValueIndex) {

                point = data[minValueIndex];

                viewPortSlot = point.indexedDataPoint.viewPortSlot;

                if (viewPortSlot) {

                    value = point.values[valueIndex].value;
                    value = Math.floor(scaler(value)) + 0.5;

                    shape.push({
                        x: viewPortSlot.left,
                        y: value
                    }, {
                        x: viewPortSlot.right,
                        y: value
                    });
                }

            } else {

                if (settings.isSelected) {
                    lastMarkerIndex = 0;
                    squareSide = settings.theme.selection.squareSide;
                    viewPortSlot = data[minValueIndex].indexedDataPoint.viewPortSlot;
                    selectionMarkerDistance = this.calculateSelectionDistance(squareSide, viewPortSlot.right - viewPortSlot.left);
                    halfSelectionMarker = squareSide / 2;
                }

                if (minValueIndex > 0) {
                    point = data[minValueIndex - 1];

                    viewPortSlot = point.indexedDataPoint.viewPortSlot;

                    if (viewPortSlot) {
                        xValue = viewPortSlot.center;
                        value = point.values[valueIndex].value;

                    } else {
                        xValue = (3 * data[minValueIndex].indexedDataPoint.viewPortSlot.center - data[minValueIndex + 1].indexedDataPoint.viewPortSlot.center) / 2;

                        value = point.values[valueIndex].value;

                        maxValue = settings.scaler.valueLimits().maxValue;

                        value = value > maxValue ? maxValue : value;
                    }

                } else {
                    point = data[0];

                    xValue = point.indexedDataPoint.viewPortSlot.center;

                    value = point.values[valueIndex].value;

                    minValueIndex++;
                    lastMarkerIndex++;
                }

                shape.push({
                    x: Math.floor(xValue),
                    y: Math.floor(scaler(value))
                });

                for (index = minValueIndex; index <= maxValueIndex; index++) {

                    point = data[index];

                    xValue = Math.floor(point.indexedDataPoint.viewPortSlot.center);
                    value = Math.floor(scaler(point.values[valueIndex].value));

                    shape.push({
                        x: xValue,
                        y: value
                    });

                    if (settings.isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (maxValueIndex - index) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(xValue - halfSelectionMarker) + 0.5,
                                y: Math.floor(value - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }
                }

                if (maxValueIndex < data.length - 1) {

                    point = data[maxValueIndex + 1];

                    viewPortSlot = point.indexedDataPoint.viewPortSlot;

                    if (viewPortSlot) {
                        xValue = viewPortSlot.center;

                        value = point.values[valueIndex].value;

                    } else {
                        xValue = (3 * data[maxValueIndex].indexedDataPoint.viewPortSlot.center - data[maxValueIndex - 1].indexedDataPoint.viewPortSlot.center) / 2;
                        value = point.values[valueIndex].value;
                        maxValue = settings.scaler.valueLimits().maxValue;
                        value = value > maxValue ? maxValue : value;
                    }

                    shape.push({
                        x: Math.floor(xValue),
                        y: Math.floor(scaler(value))
                    });
                }
            }

            printer.plotOpenShape(shape, this._strokeStyle, 3);

            value = Math.floor(settings.rect.bottom);

            p1 = {
                x: shape[0].x,
                y: value
            };

            shape.splice(0, 0, p1);

            p2 = {
                x: shape[shape.length - 1].x,
                y: value
            };

            shape.splice(length, 0, p2, p1);

            printer.plotShape(shape, this._strokeStyle, gradient, 1);

            if (selectionMarkers.length) {
                this.renderSelection(selectionMarkers);
                selectionMarkers.length = 0;
            }

            shape.length = 0;
            return null; // no hotspots
        },

        dispose: function () {
            this.themeHandle.remove();
            GradientSeriePainter.prototype.dispose.call(this);
        }
    });
});
