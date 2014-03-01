define([
    'dcl/dcl',
    'localLib/Evented',
    'common/Utilities'
], function(dcl, Evented, utilities){

    return dcl(Evented, {
        declaredClass:'',
        constructor: function (settings) {
            settings = settings || {};
            settings.speed = settings.speed || 10;
            this.settings = settings;

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

        onDownGesture: function (eventType, eventObject) {
            if (eventObject.pointers.length > 1) {
                var
                    //chart = eventObject.chart,
                    pointers = eventObject.pointers;
                    //xAxis = chart.xAxis(),
                    //timeLimits = xAxis.getActualLimits(),
                    //chartWidth = chart.$chartElement().width(),
                    //leftAxisWidth = chart.getViewPortLeftMargin(),
                    //rightAxisWidth = chart.getViewPortRightMargin();

                this._pinchingData = [pointers[0], pointers[1]];
                //object._barData = this.getPointerBars(timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, pointers);
            }
            return true;
        },

        onMoveGesture: function (eventType, eventObject) {
            if (this._pinchingData) {
                if (eventObject.pointers.length < 2) {
                    return this.onUpGesture(eventType, eventObject);
                }

                var
                    chart = eventObject.chart,
                    oldPointers = this._pinchingData,
                    pointers = eventObject.pointers,
                    settings = this.settings,
                    xAxis = chart.xAxis(), delta,
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin(),
                    dataWidth = chartWidth - leftAxisWidth - rightAxisWidth,
                    limits = xAxis.limits(),
                    barWidth = dataWidth/(limits.maxValueIndex- limits.minValueIndex),
                    center = (oldPointers[0].x + oldPointers[1].x) / 2;

                if (limits.maxValueIndex - limits.minValueIndex > 10) {
                    if (Math.abs(Math.abs(pointers[1].x - pointers[0].x) - Math.abs(oldPointers[1].x - oldPointers[0].x)) < barWidth){
                        return false;
                    }

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
                this._pinchingData = [eventObject.pointers[0], eventObject.pointers[1]];
                return false;
            }
            return true;
        },

        onLeaveGesture: function (eventType, eventObject) {
            return true;
        },

        onUpGesture: function (eventType, eventObject) {
            if (this._pinchingData) {
                this._pinchingData = null;
                this._barData = null;
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
                //onRangeChangeCallback = settings.onRangeChangeCallback,
                direction = delta / Math.abs(delta),
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

            //if (onRangeChangeCallback) {
                range = xAxis.getActualLimits();
                //onRangeChangeCallback
                this.emit('range', { minValue: range.minValueIndex, maxValue: range.maxValueIndex });
            //}
        },

        onWheelGesture: function (eventType, eventObject) {
            var
                pointer = eventObject.pointers[0],
                chart = eventObject.chart,
                delta = eventObject.delta,
                xAxis = chart.xAxis(),
                center = pointer.x,
                settings = this.settings,
                chartWidth = chart.$chartElement().width(),
                leftAxisWidth = chart.getViewPortLeftMargin(),
                rightAxisWidth = chart.getViewPortRightMargin(),
                dataWidth = chartWidth - leftAxisWidth - rightAxisWidth;

            if (eventObject.delta !== 0 && pointer.region && pointer.region.type === 'series') {
                this.onCenterGesture(settings, center, delta, dataWidth, xAxis);
                return false;
            } else {
                return true;
            }
        },

        onEventCallback: function (eventType, eventObject) {
            var event, handler;
            if (eventObject.pointers[0]) {
                if (eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') {
                    event = 'on' + utilities.cap(eventType);
                    handler = this[event];
                    if (handler) {
                        return handler.call(this, eventType, eventObject);
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
                    handler = this[event];
                    if (handler) {
                        return handler.call(this, eventType, eventObject);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        },

        dispose: function (object) {
            this.settings = null;
        }
    });
});
