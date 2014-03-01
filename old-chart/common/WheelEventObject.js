define(
    [
        'chart/common/EventObject'
    ], function (EventObject) {

        function WheelEventObject(pointers, button, delta, deltaX, deltaY) {

            EventObject.call(this, pointers, [], button);

            this.delta = delta;
            this.deltaX = deltaX;
            this.deltaY = deltaY;
        }

        WheelEventObject.prototype = new EventObject();
        WheelEventObject.prototype.constructor = WheelEventObject;

        return WheelEventObject;

    }
);