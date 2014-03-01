define(
    [
        'chart/common/Point'
    ], function (Point) {
        //<summary>
        //  settings: {
        //  }
        //</summary>
        function HotSpot(x, y, index) {

            Point.call(this, x, y);
           
            this.index = index;
        }

        HotSpot.prototype = new Point();
        HotSpot.prototype.constructor = Point;

        return HotSpot;
    }
);