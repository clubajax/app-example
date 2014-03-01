define([
    'dcl/dcl',
    './BarSeriePainter'
], function(dcl, BarSeriePainter){

    return dcl(BarSeriePainter, {
        declaredClass:'CandleStickSeriePainter',
        constructor: function(){

        },
        _buildStyle: function () {

            var draw = this.settings.theme.draw;
            if(this.settings.style && this.settings.style.lineStyle){
                draw = draw[this.settings.style.lineStyle];
            }

            this._strokeStyle.width = draw.width;
            this._strokeStyle.colorBear = 'rgba(' + draw.colorBear + ', 1)';
            this._strokeStyle.colorBull = 'rgba(' + draw.colorBull + ', 1)';

            if(!this.themeHandle){
                this.themeHandle = this.settings.theme.on('change', '_buildStyle', this);
            }
        },

        _render: function () {

            var
                lastMarkerIndex,
                selectionMarkerDistance,
                halfSelectionMarker,
                selectionMarkers,
                halfBarWidth,
                prevColor,
                center,
                color,
                shape = [],
                settings = this.settings,
                printer = settings.printer,
                strokeStyle = {
                    width: this._strokeStyle.width
                },
                scaler = settings.scaler.calculate,
                openIndex = settings.valueIndexes[0],
                highIndex = settings.valueIndexes[1],
                lowIndex = settings.valueIndexes[2],
                closeIndex = settings.valueIndexes[3],
                openValue,
                closeValue,
                diffValue,
                temp,
                datas = settings.serie.data,
                time = settings.serie.limits.time,
                xMinLimit = time.minValueIndex,
                xMaxLimit = time.maxValueIndex,
                point = datas[xMinLimit],
                barwidth = point.indexedDataPoint.viewPortSlot.right - point.indexedDataPoint.viewPortSlot.left;

            if (settings.isSelected) {
                lastMarkerIndex = 0;
                selectionMarkerDistance = this.calculateSelectionDistance(settings.theme.selection.squareSide, barwidth);
                selectionMarkers = this.selectionMarkers;
                halfSelectionMarker = settings.theme.selection.squareSide / 2;
            }

            barwidth *= this._slotXPercentageUsage;

            if (point.values[openIndex].value > point.values[closeIndex].value) {
                prevColor = this._strokeStyle.colorBear;
            } else {
                prevColor = this._strokeStyle.colorBull;
            }

            if (barwidth >= 3) {

                barwidth = Math.floor(barwidth);
                if (barwidth % 2 === 0) {
                    barwidth--;
                }
                halfBarWidth = Math.floor(barwidth / 2);


                while (xMinLimit <= xMaxLimit) {

                    point = datas[xMinLimit];

                    center = Math.floor(point.indexedDataPoint.viewPortSlot.center);

                    openValue = point.values[openIndex].value;
                    closeValue = point.values[closeIndex].value;

                    if (openValue > closeValue) {
                        color = this._strokeStyle.colorBear;
                        openValue = Math.floor(scaler(openValue));
                        closeValue = Math.floor(scaler(closeValue));

                    } else {
                        color = this._strokeStyle.colorBull;
                        temp = openValue;
                        openValue = Math.floor(scaler(closeValue));
                        closeValue = Math.floor(scaler(temp));
                    }

                    if (prevColor !== color) {
                        strokeStyle.color = prevColor;
                        printer.plotLines(shape, strokeStyle, 3);
                        shape.length = 0;
                        prevColor = color;
                    }

                    shape.push({
                        x0: center + 0.5,
                        y0: Math.floor(scaler(point.values[highIndex].value)),
                        x1: center + 0.5,
                        y1: Math.floor(scaler(point.values[lowIndex].value))
                    });

                    diffValue = closeValue - openValue;

                    if (diffValue < 1) {

                        closeValue -= 0.5;

                        shape.push({
                            x0: center - halfBarWidth,
                            y0: closeValue,
                            x1: center + halfBarWidth,
                            y1: closeValue
                        });


                    } else {

                        Math.floor(diffValue);

                        printer.plotRectangle(
                            center - halfBarWidth,
                            closeValue - diffValue,
                            barwidth,
                            diffValue,
                            color);
                    }

                    if (settings.isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (xMaxLimit - xMinLimit) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(center - halfSelectionMarker) + 0.5,
                                y: Math.floor((color === this._strokeStyle.colorBear ? openValue : closeValue) - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }

                    xMinLimit++;

                }

                strokeStyle.color = color;
                printer.plotLines(shape, strokeStyle, 3);

            } else {

                while (xMinLimit <= xMaxLimit) {

                    point = datas[xMinLimit];
                    center = Math.floor(point.indexedDataPoint.viewPortSlot.center) + 0.5;
                    openValue = point.values[openIndex].value;
                    closeValue = point.values[closeIndex].value;

                    if (openValue > closeValue) {
                        color = this._strokeStyle.colorBear;
                        openValue = Math.floor(scaler(openValue));

                    } else {
                        color = this._strokeStyle.colorBull;
                        openValue = Math.floor(scaler(closeValue));
                    }

                    if (prevColor !== color) {
                        strokeStyle.color = prevColor;
                        printer.plotLines(shape, strokeStyle, 4);
                        shape.length = 0;
                        prevColor = color;
                    }

                    shape.push({
                        x0: center,
                        y0: Math.floor(scaler(point.values[highIndex].value)),
                        x1: center,
                        y1: Math.floor(scaler(point.values[lowIndex].value))
                    });

                    if (settings.isSelected) {
                        if (lastMarkerIndex === selectionMarkerDistance && (xMaxLimit - xMinLimit) > selectionMarkerDistance) {
                            selectionMarkers.push({
                                x: Math.floor(center - halfSelectionMarker) + 0.5,
                                y: Math.floor((color === this._strokeStyle.colorBear ? openValue : closeValue) - halfSelectionMarker) + 0.5
                            });
                            lastMarkerIndex = 0;
                        } else {
                            lastMarkerIndex++;
                        }
                    }

                    xMinLimit++;
                }

                strokeStyle.color = color;
                printer.plotLines(shape, strokeStyle, 4);
            }

            shape.length = 0;

            if (settings.isSelected) {
                this.renderSelection(selectionMarkers);
                selectionMarkers.length = 0;
            }

            return null; // no hotspots
        },

        preRender: function (index, valueKey) {
            // only used for labels
            var
                settings = this.settings,
                openIndex = settings.valueIndexes[0],
                closeIndex = settings.valueIndexes[3],
                values = settings.serie.data[index].values,
                draw = settings.theme.draw;
                if(settings.style && settings.style.lineStyle){
                    draw = draw[settings.style.lineStyle];
                }

            return {
                color: values[openIndex].value > values[closeIndex].value ? draw.colorBear : draw.colorBull,
                value: values[valueKey].value,
                fontColor: settings.theme.draw.indication.fontColor
            };
        },

        dispose: function () {
            this.themeHandle.remove();
            BarSeriePainter.prototype.dispose.call(this);
        }
    });
});
