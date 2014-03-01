define([
    'dcl/dcl',
    'chart/seriePainters/SelectableSeriePainter',
    'common/Utilities'
], function(dcl, SelectableSeriePainter, utilities){

    return dcl(SelectableSeriePainter, {
        declaredClass:'DataSeriePainter',
        constructor: function(settings){
            if (settings) {
                this.valueIndexes = utilities.settingProperty(settings, 'valueIndexes');
            }
        },
        dispose: function () {
            this.valueIndexes = null;
            SelectableSeriePainter.prototype.dispose.call(this);
        }
    });
});
