define([
    'dcl/dcl',
    'chart/seriePainters/DataSeriePainter',
    'common/Utilities'
], function(dcl, DataSeriePainter, utilities){

    return dcl(DataSeriePainter, {
        declaredClass:'MultiSlotSeriePainter',
        constructor: function(){},
        cleanIndex: function (minIndex, maxIndex) {
            var
                viewPortSlot,
                slotA,
                slotB,
                data = this.settings.serie.data,
                rect = this.settings.rect;

            if (minIndex === maxIndex) {
                viewPortSlot = data[minIndex].indexedDataPoint.viewPortSlot;
                slotB = viewPortSlot.right;
                slotA = viewPortSlot.left;

            } else {
                viewPortSlot = data[minIndex - 1] && data[minIndex - 1].indexedDataPoint.viewPortSlot;
                slotA = viewPortSlot ? viewPortSlot.center : 0;
                slotB = data[maxIndex + 1] && data[maxIndex + 1].indexedDataPoint.viewPortSlot;
                slotB = slotB ? slotB.center : rect.right;
            }

            slotA = Math.floor(slotA);
            this.settings.printer.cleanRectangle(slotA, rect.top, Math.floor(slotB) - slotA, rect.bottom - rect.top);
        },

        renderIndex: function (index) {

            var
                time = this.settings.serie.limits.time,
                length = this.settings.serie.data.length,
                newMinIndex,
                newMaxIndex,
                currentXMinIndex = time.minValueIndex,
                currentXMaxIndex = time.maxValueIndex;

            if (length === 1) {
                newMinIndex = index;
                newMaxIndex = index;
            } else {
                if (index === currentXMinIndex) {
                    newMinIndex = index;
                    newMaxIndex = index + 1;
                } else if (index === currentXMaxIndex) {
                    newMinIndex = index - 1;
                    newMaxIndex = index;
                } else {
                    newMinIndex = currentXMinIndex;
                    newMaxIndex = currentXMaxIndex;
                }
            }

            time.minValueIndex = newMinIndex;
            time.maxValueIndex = newMaxIndex;

            this.cleanIndex(newMinIndex, newMaxIndex);

            this._render();

            time.minValueIndex = currentXMinIndex;
            time.maxValueIndex = currentXMaxIndex;
        },

        dispose: function () {
            DataSeriePainter.prototype.dispose.call(this);
        }
    });
});
