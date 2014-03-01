define([
    'dcl/dcl',
    'chart/seriePainters/SeriePainter',
    'common/Utilities'
], function(dcl, SeriePainter, utilities){

    return dcl(SeriePainter, {
        declaredClass:'SelectableSeriePainter',
        constructor: function(settings){
            if (settings) {
                this.selectionMarkers = [];
                this.isSelected = utilities.settingProperty(settings, 'isSelected');
            }
        },
        renderSelection: function (markers, style) {

                style = style || this.settings.theme.selection;

                var length = markers.length,
                    marker,
                    markerSize = style.squareSide,
                    _printer = this.settings.printer,
                    color = style.color;

                style.color = 'rgba(' + style.color + ',1)';



                for (marker = markers[0]; length; marker = markers[--length]) {
                    _printer.plotFrame(
                        Math.floor(marker.x) + 0.5,
                        Math.floor(marker.y) + 0.5,
                        markerSize,
                        markerSize,
                        style,
                        3);
                }

                // weird. without this, it turns to the color of the line.
                style.color = color;

            },

        calculateSelectionDistance: function (xLength, barSlotWidth) {
            var _ratio = xLength / barSlotWidth;
            return _ratio > 0.8 ? Math.floor(xLength * 0.5 * _ratio) : 2;
        },

        dispose: function () {
            SeriePainter.prototype.dispose.call(this);
            this.selectionMarkers = null;
            this.isSelected = null;
        }
    });
});
