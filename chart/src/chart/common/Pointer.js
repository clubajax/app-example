define([
    'dcl/dcl',
    'chart/common/IdentifiablePoint'
], function (dcl, IdentifiablePoint) {

    return dcl(IdentifiablePoint, {
        declaredClass:'Pointer',
        constructor: function(id, x, y, region, offsetX, offsetY){ // FIX THIS ORDER
            this.region = region;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.version = new Date().getTime();
        }
    });
});
