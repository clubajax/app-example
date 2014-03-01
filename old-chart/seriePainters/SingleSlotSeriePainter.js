define([
    'dcl/dcl',
    './DataSeriePainter'
], function(dcl, DataSeriePainter){

    return dcl(DataSeriePainter, {
        declaredClass:'SingleSlotSeriePainter',
        constructor: function(settings){
            if (settings) {
                this._slotXPercentageUsage = 0.8;
            }
        },
        cleanIndex: function (index) {
            var settings = this.settings,
                viewPortSlot = settings.serie.data[index].indexedDataPoint.viewPortSlot,
                rect = settings.rect;

            settings.printer.cleanRectangle(viewPortSlot.left, rect.top, viewPortSlot.right - viewPortSlot.left, rect.bottom - rect.top);
        },
        dispose: function () {
            DataSeriePainter.prototype.dispose.call(this);
        }
    });
});
