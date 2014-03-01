define([
    'dcl/dcl'
], function (dcl, Point) {

    return dcl(Point, {
        declaredClass:'IdentifiablePoint',
        constructor: function(id, x, y){ // FIX THIS ORDER
            this.x = x;
            this.y = y;
            this.id = id;
        }
    });
});
