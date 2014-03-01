define(['common/Utilities'], function (utilities) {

    function VerticalZoomHelper() {

    }

    VerticalZoomHelper.prototype = {
        init: function (object, settings) {
            settings = settings || {};
            settings.speed = settings.speed || 10;
            settings.timeout = settings.timeout || 250;

            object.settings = settings;
            object._clicks = 0;

        },
        ////this is to reset on double click
        ////also we need to implement mouse down and drag (like datatip)
        //jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
        //    return this.each(function(){
        //        var clicks = 0, self = this;
        //        jQuery(this).click(function(event){
        //            clicks++;
        //            if (clicks == 1) {
        //                setTimeout(function(){
        //                    if(clicks == 1) {
        //                        single_click_callback.call(self, event);
        //                    } else {
        //                        double_click_callback.call(self, event);
        //                    }
        //                    clicks = 0;
        //                }, timeout || 300);
        //            }
        //        });
        //    });
        //}

        onEventCallback: function (object, eventType, eventObject) {
            var event, handler;
            if (eventObject.pointers[0]) {
                if (eventObject.pointers[0].region && (eventObject.pointers[0].region.type === 'rightAxis' || eventObject.pointers[0].region.type === 'leftAxis')) {
                    event = 'on' + utilities.cap(eventType);
                    handler = self[event];
                    if (handler) {
                        handler.call(self, object, eventType, eventObject);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                if (eventType === 'upGesture') {
                    event = 'on' + utilities.cap(eventType);
                    handler = self[event];
                    if (handler) {
                        handler.call(self, object, eventType, eventObject);
                    } else {
                        return true;
                    }
                }
            }
        },
        
        onDownGesture: function (object, eventType, eventObject) {

            var yAxis = eventObject.pointers[0].axis;

            object._clicks++;

            object._lastPrice = eventObject.pointers[0].prices[eventObject.pointers[0].axisIndex].value;

            setTimeout(function () {
                if (object._clicks > 1) {
                    yAxis.limits('auto');
                }
                object._clicks = 0;
            }, object.settings.timeout);

            return true;
        },

        onMoveGesture: function (object, eventType, eventObject) {
            if (object._lastPrice) {
                var newPrice = eventObject.pointers[0].prices[eventObject.pointers[0].axisIndex].value, yAxis = eventObject.pointers[0].axis,
                    yAxisLimits = yAxis.getActualLimits(),
                    maxValue = yAxisLimits.maxValue,
                    minValue = yAxisLimits.minValue,
                    priceDelta = newPrice - object._lastPrice, delta,
                    absPriceDelta = Math.abs(priceDelta),
                    percent;
                if (maxValue > minValue) {
                    percent = absPriceDelta / (maxValue - minValue);
                    if (percent > 0.01) {
                        delta = (priceDelta/absPriceDelta) * Math.round(percent / 0.01);
                        eventObject.delta = delta;
                        object._lastPrice = newPrice;
                        return self.onWheelGesture(object, eventType, eventObject);
                    }
                }
            }
            return true;
        },

        onLeaveGesture: function (object, eventType, eventObject) {
            object._clicks = null;
            object._lastPrice = null;

            return true;
        },

        onUpGesture: function (object, eventType, eventObject) {
            if (object._lastPrice) {
                object._lastPrice = null;
            }
            return true;
        },

        onWheelGesture: function (object, eventType, eventObject) {
            if (eventObject.delta !== 0) {

                var settings = object.settings, range, percent, ratio, delta = eventObject.delta,
                    //chart = eventObject.chart,
                    yAxis = eventObject.pointers[0].axis,
                    //minMove = yAxis.minMove(),
                    currentYLimits = yAxis.getActualLimits(),
                    position, high, low,
                    newRange = currentYLimits;


                if (Math.abs(delta) >= settings.speed) {
                    delta = (settings.speed - 1) * delta / Math.abs(delta);
                }

                percent = 1 - delta / settings.speed;

                range = currentYLimits.maxValue - currentYLimits.minValue;

                newRange = range * percent;

                //if (newRange === range) {
                //    newRange += 2 * minMove * eventObject.delta;
                //}

                position = eventObject.pointers[0].prices[eventObject.pointers[0].axisIndex].value;

                ratio = (position - currentYLimits.minValue) / range;

                low = position - newRange * ratio;

                //low = minMove * Math.round(low / minMove);

                high = position + newRange * (1 - ratio);

                //high = minMove * Math.round(high / minMove);

                newRange = high - low;

                //if (newRange === range) {
                //    low -= minMove * eventObject.delta;
                //    high += minMove * eventObject.delta;
                //}
                //if (low === high) {
                //    high = low + minMove;
                //}
                //console.log('min: ' + low + ', max: ' + high);
                yAxis.limits({ minValue: low, maxValue: high });
            } else {
                return true;
            }
        },

        dispose: function (object) {
            object.settings = null;
        }
    };

    VerticalZoomHelper.prototype.constructor = VerticalZoomHelper;

    var self = new VerticalZoomHelper();

    return self;
}
);