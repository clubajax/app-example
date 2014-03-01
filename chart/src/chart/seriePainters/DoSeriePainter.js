define(['jquery', 'chart/seriePainters/SelectableSeriePainter', 'common/Utilities'], function ($, SelectableSeriePainter, utilities) {

    function DoSeriePainter(settings) {
        SelectableSeriePainter.call(this, settings);

        if (settings) {

            var self = this;

            this.inputs = utilities.settingProperty(settings, 'inputs');

            this._hotSpotStyle = { color: null, rgb: [] };

            this.style = utilities.settingProperty(settings, 'style', function () {
                self._buildHotSpotStyle();
            });

            self._buildHotSpotStyle();
        }
        
    }

    DoSeriePainter.prototype = $.extend(
        true,
        new SelectableSeriePainter(), {

            renderIndex: function () {

            },

            preRender: function () {
                return null;
            },

            renderHotSpot: function (markers, frameColor, style) {

                style = style || this.settings.theme.selection;

                var length = markers.length,
                    marker, x, y,
                    markerSize = style.squareSide,
                    oColor = style.color,
                    color = 'rgba(' + oColor + ',1)',
                    _printer = this.settings.printer;

                frameColor = 'rgba(' + frameColor + ',1)';

                style.color = frameColor;

                for (marker = markers[0]; length; marker = markers[--length]) {

                    x = Math.floor(marker.x);
                    y = Math.floor(marker.y);

                    _printer.plotFrame(
                        x - 1,
                        y - 1,
                        markerSize + 2,
                        markerSize + 2,
                        style,
                        3);

                    _printer.plotRectangle(
                        x,
                        y,
                        markerSize,
                        markerSize,
                        color);
                }

                style.color = oColor;

            },

            hitHotSpotTest: function (x, y, color, hotSpots) {
                var style, length, i, hotSpot, halfMarker, isHotSpotColor//, isFrameColor;

                if (hotSpots.splice) {

                    style = this.settings.theme.selection;

                    //isFrameColor = color === this._hotSpotStyle.color;

                    //isHotSpotColor = !isFrameColor && color !== style.color;

                    isHotSpotColor = color !== style.color;

                    length = hotSpots.length;
                    halfMarker = (style.squareSide / 2) + 2;

                    for (i = 0; i < length; i++) {
                        hotSpot = hotSpots[i];
                        if (((hotSpot.x > x - halfMarker && hotSpot.x < x + halfMarker) || (hotSpot.x === null && isHotSpotColor)) && ((hotSpot.y > y - halfMarker && hotSpot.y < y + halfMarker) || (hotSpot.y === null && isHotSpotColor))) {
                            return hotSpot;
                        }
                    }

                }

                return false;

            },

            _buildHotSpotStyle: function () {

                this.settings.theme.selection.color = this.settings.theme.selection.color.replace(/\s/g, '');

                var rgb = this.settings.theme.draw.color.split(','), length = rgb.length, nrgb = "", rgbArray = this._hotSpotStyle.rgb;

                do {

                    --length;

                    rgbArray[length] = parseInt(rgb[length].replace(/\s/g, ''), 10) - 1;

                    nrgb = nrgb.concat(rgbArray[length], ',');

                } while (length);


                this._hotSpotStyle.color = nrgb;
            },
            
            calculateSelectionDistance: function(slotWidth, desiredDistance) {
                var result, lower, higher;

                if (!desiredDistance) {
                    desiredDistance = 80;
                }

                if (slotWidth < desiredDistance) {
                    lower = Math.floor(desiredDistance / slotWidth);
                    higher = lower + 1;

                    if (desiredDistance - lower * slotWidth < higher * slotWidth - desiredDistance) {
                        result = lower * slotWidth;
                    } else {
                        result = higher * slotWidth;
                    }
                } else {
                    lower = Math.floor(slotWidth / desiredDistance);
                    higher = lower + 1;

                    if (desiredDistance - slotWidth / higher < slotWidth / lower - desiredDistance) {
                        result = slotWidth / higher;
                    } else {
                        result = slotWidth / lower;
                    }
                }

                return result;
            },

            dispose: function () {

                this.inputs = null;

                this._hotSpotStyle.rgb.length = 0;
                this._hotSpotStyle = null;
                this.style = null;

                SelectableSeriePainter.prototype.dispose.call(this);
            }
        });

    return DoSeriePainter;
});
