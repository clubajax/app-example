define(
    [
        'chart/common/IdentifiablePoint'
    ], function (IdentifiablePoint) {

        function Pointer(id, x, y, region, offsetX, offsetY) {
            
            IdentifiablePoint.call(this, id, x, y);

            this.region = region;
            this.offsetX = offsetX;
            this.offsetY = offsetY;

            this.version = new Date().getTime();

        }

        Pointer.prototype = new IdentifiablePoint();
        Pointer.prototype.constructor = Pointer;

        return Pointer;

    }
);