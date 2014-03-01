define([
    'dcl/dcl',
    './MultiSlotSeriePainter',
    'common/Utilities'
], function(dcl, MultiSlotSeriePainter, utilities){

    return dcl(MultiSlotSeriePainter, {
        declaredClass:'GradientSeriePainter',
        constructor: function(settings){
            if (settings) {

                MultiSlotSeriePainter.call(this, settings);

                settings.printer.addLayer();

                this._gradient = [];
                this._strokeStyle = {};

                this.style = utilities.settingProperty(settings, 'style', function () {
                    this._buildStyle();
                    this._buildHotSpotStyle();
                }.bind(this));

                this.rect = utilities.settingProperty(settings, 'rect', function () {
                    this._buildStyle();
                }.bind(this));

                this.parentChangeRect = this.changeRect;

                this._buildStyle();
            }
        },
        changeRect: function (rect, scaler) {
            if (this.parentChangeRect) {
                this.parentChangeRect(rect, scaler);
            }
            this._buildStyle();
        },
        dispose: function () {
            this.parentChangeRect = null;
            this._gradient = null;
            this._strokeStyle = null;
            this.style = null;
            this.rect = null;
            this.changeRect = null;

            MultiSlotSeriePainter.prototype.dispose.call(this);
        }
    });
});
