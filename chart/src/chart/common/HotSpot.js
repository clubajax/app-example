define([
    'dcl/dcl'
], function (dcl) {
    return dcl(null, {
        declaredClass:'HotSpot',
        constructor: function(x, y, index){ // FIX THIS ORDER
            this.x = x;
            this.y = y;
            this.index = index;
            this.HOTSPOT = true;
        }
    });
});
