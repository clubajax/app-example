//<sumary>
// this class handle: rendering of data series - line format
//</summary>
define(
    [
    'common/Utilities',
    'chart/common/HotSpot',
    'chart/seriePainters/DoSeriePainter'
    ], function (utilities, HotSpot, DoSeriePainter) {

        function VerticalLineDoSeriePainter(settings) {
            DoSeriePainter.call(this, settings);
        }

        VerticalLineDoSeriePainter.prototype = $.extend(
            true,
            new DoSeriePainter(), {
                calculateSelectionDistance: function () {
                    return 60;
                },

                _render: function () {
                    var settings = this.settings,
                        printer = settings.printer,
                        scaler = settings.scaler.calculate,
                        draw = settings.theme.draw,
                        indexedData = settings.indexedData,
                        index = settings.valueIndexes && settings.valueIndexes.length ? settings.valueIndexes[0] : 0,
                        inputs = utilities.getValue(settings.serie.inputs),
                        timeStamp = inputs[index].value.timeStamp, i,
                        viewportPixel, hotSpots = [],
                        squareSide = settings.theme.selection.squareSide,
                        isSelected = settings.isSelected,
                        selectionMarkerDistance, y2, x1, y1, halfSelectionMarker, length, search, value;

                    if (isSelected) {
                        halfSelectionMarker = squareSide / 2;
                    }

                    if( settings.style &&  settings.style.lineStyle){
                        draw = draw[settings.style.lineStyle];
                    }

                    search = utilities.searchClosestTimeStamp(indexedData.data, { timeStamp: timeStamp });

                    if (search.index >= indexedData.beginIndex && search.index <= indexedData.endIndex) {

                        viewportPixel = indexedData.data[search.index].viewPortSlot;

                        if (viewportPixel) {

                            style.color = 'rgba(' + draw.color + ', 1)';
                            style.width = draw.width;

                            x1 = Math.floor(viewportPixel.center) + 0.5;

                            if (settings.impersonatePainter) {
                                
                                y1 = scaler(inputs[0].value.price);
                                y2 = scaler(inputs[1].value.price);
                                
                                hotSpots.push(new HotSpot(x1, y1, 0));
                                hotSpots.push(new HotSpot(x1, y2, 1));
                                hotSpots.push(new HotSpot(null, null, null));

                                if (isSelected) {

                                    selectionMarkers.push({
                                        x: x1 - halfSelectionMarker,
                                        y: y1 - halfSelectionMarker
                                    });

                                    selectionMarkers.push({
                                        x: x1 - halfSelectionMarker,
                                        y: y2 - halfSelectionMarker
                                    });
                                }

                                if (y2 < y1) {
                                    value = y2;
                                    y2 = y1;
                                    y1 = value;
                                }

                            } else {
                                y1 = settings.rect.top;
                                y2 = settings.rect.bottom;
                                
                                hotSpots.push(new HotSpot(x1, null, index));
                            }

                            printer.plotLine(x1, y1, x1, y2, style, 3);

                            if (isSelected) {
                                
                                this.renderHotSpot(selectionMarkers, this._hotSpotStyle.color);
                                
                                selectionMarkers.length = 0;

                                selectionMarkerDistance = this.calculateSelectionDistance();

                                length = (y2 - y1 - 2 * squareSide) / selectionMarkerDistance;

                                length = length - length % 1;

                                for (i = 1; i <= length; i++) {
                                    y1 = y2 - (i * selectionMarkerDistance);

                                    selectionMarkers.push({
                                        x: x1 - halfSelectionMarker,
                                        y: y1 - halfSelectionMarker
                                    });
                                }

                                this.renderSelection(selectionMarkers);
                            }
                        }
                    }

                    selectionMarkers.length = 0;

                    return hotSpots;
                },

                dispose: function () {
                    DoSeriePainter.prototype.dispose.call(this);
                }
            });

        var selectionMarkers = [], style = { color: null, width: null, squareSide: null };

        return VerticalLineDoSeriePainter;
    });
