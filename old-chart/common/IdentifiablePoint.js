define(
    [
        'chart/common/Point'
    ], function (Point) {

        function IdentifiablePoint(id, x, y) {
            
            Point.call(this, x, y);

            this.id = id;
        }

        IdentifiablePoint.prototype = new Point();
        IdentifiablePoint.prototype.constructor = IdentifiablePoint;

        return IdentifiablePoint;

    }
);