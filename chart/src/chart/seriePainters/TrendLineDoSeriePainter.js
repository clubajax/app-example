//<sumary>
// this class handle: rendering of data series - line format
//</summary>
define([
    'jquery',
    'common/Utilities',
    'chart/seriePainters/DoSeriePainter',
    'chart/seriePainters/VerticalLineDoSeriePainter',
    'chart/common/HotSpot'
], function ($, utilities, DoSeriePainter, VerticalLineDoSeriePainter, HotSpot) {

    function TrendLineDoSeriePainter(settings) {
        DoSeriePainter.call(this, settings);
    }

    TrendLineDoSeriePainter.prototype = $.extend(
        true,
        new DoSeriePainter(),
        {
            calculateXCoordinates: function (idx1, idx2, x1, x2, vpBegin, vpEnd, barWidth) {
                var flipped = x2 < x1, temp;

                if (flipped) {
                    temp = x1;
                    x1 = x2;
                    x2 = temp;
                    temp = idx1;
                    idx1 = idx2;
                    idx2 = temp;
                }

                if (x1 < vpBegin || x1 > vpEnd) {
                    x1 = vpBegin;
                } else {
                    x1 = x1 + 0.5 * barWidth;
                }


                return {
                    idx1: idx1,
                    idx2: idx2,
                    x1: x1,
                    x2: x2
                };
            },

            translate: function (x, begin, end, vpbegin, vpend) {
                var result = ((x - begin) / (end - begin)) * (vpend - vpbegin) + vpbegin;
                return result;
            },

            calculatePricePixel: function (x, slope, intercept, scaler) {
                var pricey = x * slope + intercept;
                y = scaler(pricey);// this.computeY(pricey, yMinValue, yScale, height);
                return y;
            },

            calculatePortPixels: function (indexedData, from, to, barWidth, scaler, rect, fromidx, toidx) {
                var idx1, idx2, y1, y2, x1, x2, slope, intercept, begin, end, calc, result = null, dy, dx,
                    fromx, fromy, tox, toy;

                idx1 = fromidx || utilities.searchClosestTimeStamp(indexedData.data, { timeStamp: from.value.timeStamp }).index;

                idx2 = toidx || utilities.searchClosestTimeStamp(indexedData.data, { timeStamp: to.value.timeStamp }).index;

                if (idx1 < indexedData.endIndex || idx2 < indexedData.endIndex) {

                    fromx = x1 = (idx1 + 0.5) * barWidth;
                    y1 = from.value.price;
                    fromy = scaler(y1);//  this.computeY(y1, yMinValue, yScale, height);

                    tox = x2 = (idx2 + 0.5) * barWidth;
                    y2 = to.value.price;
                    toy = scaler(y2);// this.computeY(y2, yMinValue, yScale, height);

                    dx = (x2 - x1);

                    dy = (y2 - y1);

                    //if different bars then slope else if more on x than y, horizontal line otherwise vertical
                    slope = dx ? dy / dx : 0;

                    //if different bars then intercept else if more on x than y, horizontal line otherwise if going up then line up otherwise down
                    intercept = dx ? y2 - (slope * x2) : y1;

                    begin = indexedData.beginIndex * barWidth;

                    end = (indexedData.endIndex + 1) * barWidth;

                    x1 = idx1 * barWidth;

                    x2 = idx2 * barWidth;

                    calc = this.calculateXCoordinates(idx1, idx2, x1, x2, begin, end, barWidth);

                    x1 = calc.x1;

                    if (to.stop || from.stop) {

                        x2 = calc.idx2 + 0.5;

                        if (x2 > indexedData.endIndex + 1) {
                            x2 = indexedData.endIndex + 1;
                        }

                    } else {
                        x2 = indexedData.endIndex + 1;
                    }

                    x2 *= barWidth;

                    y1 = this.calculatePricePixel(x1, slope, intercept, scaler);

                    y2 = this.calculatePricePixel(x2, slope, intercept, scaler);

                    result = {
                        //                        idx1 : idx1,
                        //                        idx2 : idx2,
                        x1: x1,
                        x2: x2,
                        y1: y1,
                        y2: y2,
                        begin: begin,
                        end: end,
                        slope: slope,
                        intercept: intercept,
                        fromx: fromx,
                        fromy: fromy,
                        tox: tox,
                        toy: toy
                    };
                }

                return result;
            },

            findSelectionWidth: function (desiredWidth, vpx1, vpx2, left, right, scaler, calculation, halfSelectionMarker) {
                var x1, y1, x2, y2, a, b, c, result = desiredWidth, stop, squareResult,
                    slope = calculation.slope, intercept = calculation.intercept;

                do {
                    x1 = this.translate(vpx1, calculation.begin, calculation.end, left, right) - halfSelectionMarker;
                    y1 = this.calculatePricePixel(x1, slope, intercept, scaler) - halfSelectionMarker;
                    x2 = x1 + result;
                    y2 = this.calculatePricePixel(x2, slope, intercept, scaler) - halfSelectionMarker;
                    a = x2 - x1;
                    b = y2 - y1;
                    c = Math.sqrt(a * a + b * b);
                    stop = Math.abs(c - desiredWidth) < 9;
                    if (!stop) {
                        result = result * result / c;
                    }
                } while (!stop);

                return result;
            },

            _render: function () {
                var settings = this.settings,
                    printer = settings.printer,
                    scaler = settings.scaler.calculate,
                    draw = settings.theme.draw,
                    indexedData = settings.indexedData,
                    viewportPixel = indexedData.data[indexedData.beginIndex].viewPortSlot,
                    rect = settings.rect,
                    inputs = utilities.getValue(settings.serie.inputs),
                    index1 = settings.valueIndexes && settings.valueIndexes.length ? settings.valueIndexes[0] : 0,
                    index2 = settings.valueIndexes && settings.valueIndexes.length ? settings.valueIndexes[1] : 1,
                    from = inputs[index1],
                    to = inputs[index2],
                    slotWidth, hotSpots = null,
                    squareSide = settings.theme.selection.squareSide,
                    idx1, idx2, vpx1, vpx2,
                    selectionMarkerDistance, x2, x1, halfSelectionMarker, slope, calculation, intercept, left, right;

                if( settings.style &&  settings.style.lineStyle){
                    draw = draw[settings.style.lineStyle];
                }


                if(!to){
                    throw new Error('trendLine given only one point');
                }

                idx1 = utilities.searchClosestTimeStamp(indexedData.data, { timeStamp: from.value.timeStamp }).index;
                idx2 = utilities.searchClosestTimeStamp(indexedData.data, { timeStamp: to.value.timeStamp }).index;

                if (idx1 !== idx2 || from.value.price === to.value.price) {

                    slotWidth = viewportPixel.right - viewportPixel.left;

                    from.stop = settings.stop;
                    to.stop = settings.stop;

                    calculation = this.calculatePortPixels(indexedData, from, to, slotWidth, scaler, rect, idx1, idx2);

                    if (calculation) {

                        left = 0;//rect.left;
                        right = rect.right - rect.left;

                        vpx1 = this.translate(calculation.x1, calculation.begin, calculation.end, left, right);
                        vpx2 = this.translate(calculation.x2, calculation.begin, calculation.end, left, right);

                        style.color = 'rgba(' + draw.color + ', 1)';
                        style.width = draw.width;

                        printer.plotLine(vpx1, calculation.y1, (Math.floor(vpx2) === Math.floor(vpx1) ? vpx1 + 1 : vpx2), calculation.y2, style, 3);

                        hotSpots = [
                            new HotSpot(this.translate(calculation.fromx, calculation.begin, calculation.end, left, right), calculation.fromy, index1),
                            new HotSpot(this.translate(calculation.tox, calculation.begin, calculation.end, left, right), calculation.toy, index2),
                            new HotSpot(null, null, null)];

                        if (settings.isSelected) {

                            halfSelectionMarker = squareSide / 2;

                            selectionMarkerDistance = this.calculateSelectionDistance(slotWidth);

                            selectionMarkerDistance = this.findSelectionWidth(selectionMarkerDistance, vpx1, vpx2, left, right, scaler, calculation, halfSelectionMarker);

                            slope = calculation.slope;

                            selectionMarkers.length = 0;

                            intercept = calculation.intercept;

                            x1 = vpx1 + calculation.begin;

                            x2 = vpx2 + calculation.begin;

                            while ((x1 += selectionMarkerDistance) < x2) {

                                selectionMarkers.push({
                                    x: this.translate(x1, calculation.begin, calculation.end, left, right) - halfSelectionMarker,
                                    y: this.calculatePricePixel(x1, slope, intercept, scaler) - halfSelectionMarker
                                });
                            }

                            this.renderSelection(selectionMarkers);

                            selectionMarkers.length = 0;

                            selectionMarkers.push({ x: hotSpots[0].x - halfSelectionMarker, y: hotSpots[0].y - halfSelectionMarker });
                            selectionMarkers.push({ x: hotSpots[1].x - halfSelectionMarker, y: hotSpots[1].y - halfSelectionMarker });

                            this.renderHotSpot(selectionMarkers, this._hotSpotStyle.color);
                        }
                    }
                } else {

                    this.settings.impersonatePainter = true;

                    this.verticalPainter = this.verticalPainter || new VerticalLineDoSeriePainter(this.settings);

                    hotSpots = this.verticalPainter.render();
                }

                return hotSpots;

            },

            dispose: function () {
                DoSeriePainter.prototype.dispose.call(this);
            }
        });

    TrendLineDoSeriePainter.prototype.constructor = TrendLineDoSeriePainter;
    
    var style = { color: null, width: null, squareSide: null }, selectionMarkers = [];

    return TrendLineDoSeriePainter;

});
