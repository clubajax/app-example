define(['common/Utilities'], function (utilities) {

    function HorizontalZoomHelper() {

    }

    var id = 0;

    HorizontalZoomHelper.prototype = {
        init: function (object, settings) {
            settings = settings || {};
            settings.speed = settings.speed || 10;
            object.settings = settings;

        },

        getPointerBar: function (leftAxisWidth, barWidth, pointer) {
            var x = pointer.x - leftAxisWidth, bar = Math.floor(x / barWidth);
            return bar;
        },

        getPointerBars: function (timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, pointers) {
            var serieWidth = chartWidth - leftAxisWidth - rightAxisWidth,
                minBarIndex = timeLimits.minValueIndex,
                barWidth = serieWidth / (timeLimits.maxValueIndex - minBarIndex),
                i, length = pointers && pointers.length, bar,
                result = [];
            for (i = 0; i < length; i++) {
                bar = this.getPointerBar(leftAxisWidth, barWidth, pointers[i]);
                result.push(minBarIndex + bar);
            }

            return result;
        },

        onDownGesture: function (object, eventType, eventObject) {
            if (eventObject.pointers.length > 1) {
                var pointers = eventObject.pointers,
                    xAxis = chart.xAxis(), timeLimits = xAxis.getActualLimits(),
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin();

                object._pinchingData = [pointers[0], pointers[1]];
                //object._barData = this.getPointerBars(timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, pointers);
            }
            return true;
        },

        //calculateZoom: function (timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, oldPointers, barData, newPointers) {
        //    var oldMinX = oldPointers[0].x < oldPointers[1].x ? oldPointers[0].x : oldPointers[1].x,
        //        oldMaxX = oldPointers[0].x < oldPointers[1].x ? oldPointers[1].x : oldPointers[0].x,
        //        newMinX = newPointers[0].x < newPointers[1].x ? newPointers[0].x : newPointers[1].x,
        //        newMaxX = newPointers[0].x < newPointers[1].x ? newPointers[1].x : newPointers[0].x,
        //        serieWidth = chartWidth - leftAxisWidth - rightAxisWidth,
        //        barWidth = serieWidth / (timeLimits.maxValueIndex - timeLimits.minValueIndex),
        //        left, right, removed, newBarWidth, barcount,
        //        newTimeLimits = {}, oldMinIndex, oldMaxIndex, newMinIndex, newMaxIndex;

        //    if (oldPointers[0].x === newPointers[0].x && oldPointers[1].x === newPointers[1].x) {
        //        $.extend(true, newTimeLimits, timeLimits);
        //        return newTimeLimits;
        //    }

        //    barcount = Math.abs(barData[1] - barData[0]);
        //    newBarWidth = (newMaxX - newMinX) / (barcount);

        //    totalBars = Math.floor(serieWidth / newBarWidth);

        //    newBarWidth = serieWidth / totalBars;

        //    newMinIndex = Math.floor(newMinX / newBarWidth);
        //    newMaxIndex = Math.floor(newMaxX / newBarWidth);

        //    if (newMaxIndex - newMinIndex !== barcount) {
        //        //debugger;
        //    }

        //    newTimeLimits.minValueIndex = barData[0] - newMinIndex;

        //    newTimeLimits.maxValueIndex = newTimeLimits.minValueIndex + totalBars;

        //    return newTimeLimits;

        //    //oldMinIndex = (oldMinX - leftAxisWidth) / barWidth;
        //    //oldMaxIndex = (oldMaxX - leftAxisWidth) / barWidth;

        //    //how much we cut from the left
        //    left = oldMinX - newMinX;

        //    //how much we cut from the right
        //    right = newMaxX - oldMaxX;

        //    //how much we removed from the view
        //    removed = left + right;

        //    //what would be the size of the newly cropped space
        //    newSerieSize = serieWidth - removed;

        //    //how many bars would be visible now
        //    newNumberOfBars = Math.floor(newSerieSize / barWidth);

        //    //but the screen is not the one that shrinks, we need the new 
        //    // bar width
        //    newBarWidth = serieWidth / newNumberOfBars;

        //    //what would be the position for the new min pointer
        //    minBarPosition = Math.floor(newMinX / newBarWidth);

        //    //what would be the position for the new max pointer
        //    maxBarPosition = Math.floor(newMaxX / newBarWidth);

        //    //we know from bar data what is the bar that we want in the minBarPosition 
        //    // and the one that we want in the max bar position
        //    newTimeLimits.minValueIndex = timeLimits.minValueIndex + barData[0] - minBarPosition; // timeLimits.minValueIndex + left;

        //    newTimeLimits.maxValueIndex = timeLimits.maxValueIndex - (barData[1] - maxBarPosition); //timeLimits.maxValueIndex + right;

        //    //numberofBars = serieWidth / newBarWidth;

        //    //newMinIndex = (newMinX - leftAxisWidth) / barWidth;


        //    //newMaxIndex = (newMaxX - leftAxisWidth) / barWidth;

        //    //newTimeLimits.minValueIndex = timeLimits.minValueIndex - Math.round(newMinIndex - oldMinIndex);

        //    //newTimeLimits.maxValueIndex = timeLimits.maxValueIndex - Math.round(newMaxIndex - oldMaxIndex);

        //    //if (newTimeLimits.minValueIndex === timeLimits.minValueIndex && newTimeLimits.maxValueIndex === timeLimits.maxValueIndex) {
        //    //    newTimeLimits.minValueIndex += newMinIndex > oldMinIndex ? 1 : -1;
        //    //    newTimeLimits.maxValueIndex -= newMaxIndex > oldMaxIndex ? 1 : -1;
        //    //}

        //    return newTimeLimits;
        //},

        //zoom: function (chart, oldPointers, barData, newPointers, onRangeChangeCallback) {
        //    var xAxis = chart.xAxis(), timeLimits = xAxis.getActualLimits(),
        //        chartWidth = chart.$chartElement().width(),
        //        leftAxisWidth = chart.getViewPortLeftMargin(),
        //        rightAxisWidth = chart.getViewPortRightMargin(),
        //        dataWidth = chartWidth- leftAxisWidth - rightAxisWidth;


        //    //newLimits = self.calculateZoom(timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, oldPointers, barData, newPointers);
        //    //if (newLimits.minValueIndex < 0) {
        //    //    newLimits.minValueIndex = 0;
        //    //}

        //    //if (newLimits.maxValueIndex > xAxis.totalRangeMax()) {
        //    //    newLimits.maxValueIndex = xAxis.totalRangeMax();
        //    //}

        //    //xAxis.limits(newLimits);

        //    //if (onRangeChangeCallback) {
        //    //    range = xAxis.getActualLimits();
        //    //    onRangeChangeCallback({ minValue: range.minValueIndex, maxValue: range.maxValueIndex });
        //    //}

        //    return false;
        //},

        onMoveGesture: function (object, eventType, eventObject) {
            if (object._pinchingData) {
                if (eventObject.pointers.length < 2) {
                    return self.onUpGesture(object, eventType, eventObject);
                }

                var oldPointers = object._pinchingData,
                    pointers = eventObject.pointers,
                    settings = object.settings,
                    xAxis = chart.xAxis(), delta,
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin(),
                    dataWidth = chartWidth - leftAxisWidth - rightAxisWidth,
                    limits = xAxis.limits(),
                    barWidth = dataWidth/(limits.maxValueIndex- limits.minValueIndex);

                var center = (oldPointers[0].x + oldPointers[1].x) / 2;

                if (limits.maxValueIndex - limits.minValueIndex > 10) {
                    if (Math.abs(Math.abs(pointers[1].x - pointers[0].x) - Math.abs(oldPointers[1].x - oldPointers[0].x)) < barWidth)
                        return false;

                    delta = Math.abs(pointers[1].x - pointers[0].x) / Math.abs(oldPointers[1].x - oldPointers[0].x);


                    if (delta < 1) {
                        delta = -1 / delta;
                    }

                    delta *= 0.4;
                } else {
                    if (Math.abs(pointers[1].x - pointers[0].x) - Math.abs(oldPointers[1].x - oldPointers[0].x) > 0) {
                        delta = 1;
                    } else {
                        delta = -1;
                    }
                }

                this.onCenterGesture(settings, center, delta, dataWidth, xAxis);
                //var result = self.zoom(eventObject.chart, object._pinchingData, object._barData, eventObject.pointers, object.settings.onRangeChangeCallback);
                
                object._pinchingData = [eventObject.pointers[0], eventObject.pointers[1]];
                
                //object._pinchingData.kid = id++;
                //object._pinchingData[0].kid = id++;
                //object._pinchingData[1].kid = id++;
                return false;
            }
            return true;
        },

        onLeaveGesture: function (object, eventType, eventObject) {
            return true;
        },

        onUpGesture: function (object, eventType, eventObject) {
            if (object._pinchingData) {
                object._pinchingData = null;
                object._barData = null;
            }
            return true;
        },

        findLeftDelta: function (center, totalWidth, numberOfBars, suggestedTotalNumberOfBars) {
            var newBarWidth, newPosition, oldPosition, leftDelta, barWidth;

            barWidth = totalWidth / numberOfBars;

            newBarWidth = totalWidth / suggestedTotalNumberOfBars;

            newPosition = Math.ceil(center / newBarWidth);

            oldPosition = Math.ceil(center / barWidth);

            leftDelta = oldPosition - newPosition;

            return leftDelta;
        },

        onCenterGesture: function (settings, center, delta, dataWidth, xAxis) {

            var spanDelta, newLimits = {}, 
                totalTimeRange = xAxis.totalRangeMax(), leftDelta, limits = xAxis.getActualLimits(),
                span = limits.maxValueIndex - limits.minValueIndex,
                onRangeChangeCallback = settings.onRangeChangeCallback, direction = delta / Math.abs(delta),
                range, newSpan;

            if (Math.abs(delta) >= settings.speed) {
                delta = (settings.speed - 1) * delta / Math.abs(delta);
            }

            spanDelta = Math.ceil(Math.abs(span * delta / settings.speed));

            newSpan = span - direction * spanDelta;

            if (newSpan >= totalTimeRange) {
                newSpan = totalTimeRange;
            } else if (newSpan === span) {
                newSpan = delta > 0 ? span + 2 : span - 2;
            }

            leftDelta = this.findLeftDelta(center, dataWidth, span, newSpan);

            newLimits.minValueIndex = limits.minValueIndex + leftDelta;
            newLimits.maxValueIndex = newLimits.minValueIndex + newSpan;

            if (newLimits.maxValueIndex > totalTimeRange) {
                newLimits.minValueIndex = totalTimeRange - newSpan;
                newLimits.maxValueIndex = totalTimeRange;
            }

            if (newLimits.minValueIndex < 0) {
                //adding the extra
                newLimits.maxValueIndex -= newLimits.minValueIndex;
                newLimits.minValueIndex = 0;
            }

            xAxis.limits(newLimits);

            if (onRangeChangeCallback) {
                range = xAxis.getActualLimits();
                onRangeChangeCallback({ minValue: range.minValueIndex, maxValue: range.maxValueIndex });
            }
        },

        onWheelGesture: function (object, eventType, eventObject) {
            var pointer = eventObject.pointers[0];
            if (eventObject.delta !== 0 && pointer.region && pointer.region.type === 'series') {
                var chart = eventObject.chart, delta = eventObject.delta, xAxis = chart.xAxis(),
                    center = pointer.x, settings = object.settings,
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin(), 
                    dataWidth = chartWidth - leftAxisWidth - rightAxisWidth;
                this.onCenterGesture(settings, center, delta, dataWidth, xAxis);
                return false;
            } else {
                return true;
            }
        },

        onEventCallback: function (object, eventType, eventObject) {
            var event, handler;
            if (eventObject.pointers[0]) {
                if (eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') {
                    event = 'on' + utilities.cap(eventType);
                    handler = self[event];
                    if (handler) {
                        return handler.call(self, object, eventType, eventObject);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
            else {
                if (eventType === 'upGesture') {
                    event = 'on' + utilities.cap(eventType);
                    handler = self[event];
                    if (handler) {
                        return handler.call(self, object, eventType, eventObject);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        },
        dispose: function (object) {

            object.settings = null;
        }
    };

    //var rangeCallbackData = { minValue: -1, maxValue: -1 };

    HorizontalZoomHelper.prototype.constructor = HorizontalZoomHelper;

    var self = new HorizontalZoomHelper();

    return self;
}
);