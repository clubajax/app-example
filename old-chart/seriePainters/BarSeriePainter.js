define([
    'dcl/dcl',
    'common/Utilities',
    './SingleSlotSeriePainter'
], function(dcl, utilities, SingleSlotSeriePainter){

    return dcl(SingleSlotSeriePainter, {
        declaredClass:'BarSeriePainter',
        constructor: function(settings){
            if (settings) {
                this.style = utilities.settingProperty(settings, 'style', function() {
                    this._buildStyle();
                }.bind(this));

                this._strokeStyle = {};
                this._buildStyle();
            }
        },
        dispose: function () {
            this._strokeStyle = null;
            this.style = null;
            SingleSlotSeriePainter.prototype.dispose.call(this);
        }
    });
});
