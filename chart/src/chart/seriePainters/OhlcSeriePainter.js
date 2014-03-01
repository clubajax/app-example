define([
    'dcl/dcl',
    './BarSeriePainter'
], function(dcl, BarSeriePainter){

    return dcl(BarSeriePainter, {
        declaredClass:'OhlcStreamPainter',
        constructor: function(){

        },
        _buildStyle: function () {
            var draw = this.settings.theme.draw;
            if(this.settings.style && this.settings.style.lineStyle){
                draw = draw[this.settings.style.lineStyle];
            }
            this._strokeStyle.width = draw.width;
            this._strokeStyle.color = 'rgba(' + draw.color + ', 1)';
            if(!this.themeHandle){
                this.themeHandle = this.settings.theme.on('change', '_buildStyle', this);
            }
        },

        _render: function () {

            var settings = this.settings,
                time = settings.serie.limits.time,
                xMinLimit = time.minValueIndex,
                xMaxLimit = time.maxValueIndex,
                data = settings.serie.data,
                scaler = settings.scaler.calculate,
                openIndex = settings.valueIndexes[0],
                highIndex = settings.valueIndexes[1],
                lowIndex = settings.valueIndexes[2],
                closeIndex = settings.valueIndexes[3],
                halfBarWidth,
                viewPortSlot,
                lastMarkerIndex,
                selectionMarkerDistance,
                halfSelectionMarker,
                selectionMarkers,
                multiLine = [],
                distance = data[xMinLimit].indexedDataPoint.viewPortSlot.right - data[xMinLimit].indexedDataPoint.viewPortSlot.left,
                point,
                xValue,
                i1Tmp,
                yValueOpen,
                yValueHigh,
                yValueLow,
                yValueClose;

                //distance = 2

            if (settings.isSelected) {
                lastMarkerIndex = 0;
                selectionMarkerDistance = this.calculateSelectionDistance(settings.theme.selection.squareSide, distance);
                halfSelectionMarker = settings.theme.selection.squareSide / 2;
                selectionMarkers = this.selectionMarkers;
            }

            distance *= this._slotXPercentageUsage;

            if (distance > 2) {

                halfBarWidth = Math.floor(distance / 2);

                while (xMinLimit <= xMaxLimit) {

                    point = data[xMinLimit];

                    xValue = Math.floor(point.indexedDataPoint.viewPortSlot.center) + 0.5;

                    // close line
                    yValueClose = Math.floor(scaler(point.values[closeIndex].value)) + 0.5;

                    multiLine.push({
                        x0: xValue,
                        y0: yValueClose,
                        x1: xValue + halfBarWidth,
                        y1: yValueClose
                    });

                    yValueOpen = Math.floor(scaler(point.values[openIndex].value)) + 0.5;

                    multiLine.push({
                        x0: xValue - halfBarWidth,
                        y0: yValueOpen,
                        x1: xValue,
                        y1: yValueOpen
                    });

                    yValueHigh = scaler(point.values[highIndex].value);
                    yValueLow = scaler(point.values[lowIndex].value);

                    multiLine.push({
                        x0: xValue,
                        y0: yValueHigh,
                        x1: xValue,
                        y1: yValueLow
                    });

                    if (settings.isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (xMaxLimit - xMinLimit) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(xValue - halfSelectionMarker) + 0.5,
                                y: Math.floor((yValueClose > yValueOpen ? yValueLow : yValueHigh) - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }

                    xMinLimit++;
                }

            } else {
                while (xMinLimit <= xMaxLimit) {
                    point = data[xMinLimit];
                    if(!point.indexedDataPoint.viewPortSlot){
                        console.error('stupid viewPortSlot.center bug');
                    }
                    xValue = Math.floor(point.indexedDataPoint.viewPortSlot.center);
                    yValueHigh = Math.floor(scaler(point.values[highIndex].value));
                    yValueLow = Math.floor(scaler(point.values[lowIndex].value));

                    multiLine.push({
                        x0: xValue,
                        y0: yValueHigh,
                        x1: xValue,
                        y1: yValueLow
                    });

                    if (settings.isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (xMaxLimit - xMinLimit) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(xValue - halfSelectionMarker) + 0.5,
                                y: Math.floor((point.values[closeIndex].value > point.values[openIndex].value ? yValueLow : yValueHigh) - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }

                    xMinLimit++;
                }
            }

            settings.printer.plotLines(multiLine, this._strokeStyle, 3);

            multiLine.length = 0;

            if (settings.isSelected) {
                this.renderSelection(selectionMarkers);
                selectionMarkers.length = 0;
            }

            return null; // no hotspots

        },

        dispose: function () {
            this.themeHandle.remove();
            BarSeriePainter.prototype.dispose.call(this);
        }
    });
});

