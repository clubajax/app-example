
define(
    [
        'jquery',
        'chart/seriePainters/DoSeriePainter',
        'common/Utilities',
        'chart/common/HotSpot'
    ], function ($, DoSeriePainter, utilities, HotSpot) {

        function HorizontalLineDoSeriePainter(settings) {
            DoSeriePainter.call(this, settings);
        }

        HorizontalLineDoSeriePainter.prototype = $.extend(
            true,
            new DoSeriePainter(), {

                _render: function () {
                    var _settings = this.settings,
                        printer = _settings.printer,
                        scaler = _settings.scaler.calculate,
                        draw = _settings.theme.draw,
                        indexedData = _settings.indexedData,
                        i,
                        index = _settings.valueIndexes && _settings.valueIndexes.length ? _settings.valueIndexes[0] : 0,
                        inputs = utilities.getValue(_settings.serie.inputs),
                        value = inputs[index].value.price,
                        viewportPixel,
                        isSelected = _settings.isSelected, slotWidth,
                        selectionMarkerDistance, x2, x1, y1, halfSelectionMarker = null, length;

                    if(this.settings.style && this.settings.style.lineStyle){
                        draw = draw[this.settings.style.lineStyle];
                    }
                    if (isSelected) {
                        halfSelectionMarker = _settings.theme.selection.squareSide / 2;
                    }

                    style.color = 'rgba(' + draw.color + ', 1)';
                    style.width = draw.width;

                    y1 = Math.floor(scaler(value)) + 0.5;

                    x1 = _settings.rect.left;

                    x2 = _settings.rect.right;

                    x2 = x2 - x1;

                    x1 = 0;

                    printer.plotLine(x1, y1, x2, y1, style, 3);

                    if (isSelected) {

                        //compute based on a min/max number of selection points
                        viewportPixel = indexedData.data[indexedData.beginIndex].viewPortSlot;
                        slotWidth = viewportPixel.right - viewportPixel.left;

                        selectionMarkerDistance = this.calculateSelectionDistance(slotWidth);

                        length = (x2 - x1) / selectionMarkerDistance;

                        length = length - length % 1;

                        for (i = 1; i <= length; i++) {

                            x1 = x2 - (i * selectionMarkerDistance);

                            selectionMarkers.push({
                                x: x1 - halfSelectionMarker,
                                y: y1 - halfSelectionMarker
                            });
                        }

                        this.renderSelection(selectionMarkers);

                        selectionMarkers.length = 0;
                    }

                    return [new HotSpot(null, y1, index)];
                },

                dispose: function () {
                    DoSeriePainter.prototype.dispose.call(this);
                }
            });

        var style = { color: null, width: null }, selectionMarkers = [];

        return HorizontalLineDoSeriePainter;

    });
