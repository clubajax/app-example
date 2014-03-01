define(['dcl/dcl'], function (dcl) {
    // EventHandler uses this
    return dcl(null, {
        delcaredClass:'Point',
        constructor: function(x, y){
            this.x = x;
            this.y = y;
        }
    });
});
