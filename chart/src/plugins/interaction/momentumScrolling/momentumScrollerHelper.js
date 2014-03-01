define(['common/Utilities'], function (utilities) {

    function MomentumScrollerHelper() {

    }

    function computeDesacceleration2(intervals, speed, deceleration, minDisplacement) {

        //console.log('speed: ' + speed + ", deceleration: " + deceleration);

        var length = intervals.length,
            time = Math.abs(speed / deceleration), // ms
            distanceN_1, timeN, distanceN, timeN_1, i, interval;

        //console.log("time:" + time + ", distance: " + ((speed * time) + (deceleration * Math.pow(time, 2) / 2)));

        distanceN_1 = 0;
        timeN_1 = 0;

        for (i = 0; i < length; i++) {
            interval = intervals[i];

            timeN = interval.timeSlice * time;
            distanceN = (speed * timeN) + (deceleration * Math.pow(timeN, 2) / 2);

            //console.log("-- time: " + timeN + ", distanceN: " + distanceN);

            interval.time = timeN - timeN_1;
            interval.distance = distanceN - distanceN_1;

            if (interval.distanceN > 0) {
                interval.distance = Math.floor(interval.distance / minDisplacement) * minDisplacement;
            } else {
                interval.distance = Math.ceil(interval.distance / minDisplacement) * minDisplacement;
            }

            distanceN_1 = distanceN;
            timeN_1 = timeN;

            //console.log("deltaTime: " + interval.time + ", deltaDistance: " + interval.distance );
        }


        return intervals;
    }

    MomentumScrollerHelper.prototype = {
        init: function (object, settings) {
            settings = settings || {};
            settings.speed = settings.speed || 10;
            object.settings = settings;

            object._intervals = [{ timeSlice: 0.45, time: 0, distance: 0 }, { timeSlice: 0.65, time: 0, distance: 0 }, { timeSlice: 0.8, time: 0, distance: 0 }, { timeSlice: 0.9, time: 0, distance: 0 }, { timeSlice: 0.95, time: 0, distance: 0 }, { timeSlice: 1, time: 0, distance: 0 }];
        },

        //#region private 
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

        //#endregion

        onDownGesture: function (object, eventType, eventObject) {
            if (eventObject.pointers.length === 1 && eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') {
                var pointers = eventObject.pointers,
                    chart = eventObject.chart,
                    xAxis = chart.xAxis(), timeLimits = xAxis.getActualLimits(),
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin();

                object._barData = this.getPointerBars(timeLimits, leftAxisWidth, rightAxisWidth, chartWidth, pointers);
                object._calculationsBag = {
                    timeN: new Date().getTime(),
                    positionN: pointers[0].x,
                    speedN: 0,
                    accelerationN: 0
                };
                return false;
            } else {
                return true;
            }
        },

        _onMoveGesture: function (object, eventType, eventObject) {
            var pointer = eventObject.pointers[0],
                chart = eventObject.chart,
                xAxis = chart.xAxis(),
                timeLimits = xAxis.getActualLimits(),
                chartWidth = chart.$chartElement().width(),
                leftAxisWidth = chart.getViewPortLeftMargin(),
                rightAxisWidth = chart.getViewPortRightMargin(),
                numberOfBars = (timeLimits.maxValueIndex - timeLimits.minValueIndex),
                totalBars = xAxis.totalRangeMax(),
                barWidth, newPosition,
                bag = object._calculationsBag,
                newLimits = {},
                bar = object._barData[0],
                //calculate speed
                positionN = pointer.x,
                timeN = new Date().getTime(),
                deltaT = timeN - bag.timeN,
                speedN = (positionN - bag.positionN) / deltaT,
                accelerationN = (speedN - bag.speedN) / deltaT;

            bag.positionN = positionN;
            bag.timeN = timeN;
            bag.speedN = speedN;
            bag.accelerationN = accelerationN;

            //find the position of the bar and adjust the viewport
            barWidth = (chartWidth - leftAxisWidth - rightAxisWidth) / numberOfBars;
            newPosition = Math.ceil((pointer.x - leftAxisWidth) / barWidth);
            newLimits.minValueIndex = bar - newPosition;
            if (newLimits.minValueIndex < 0) {
                newLimits.minValueIndex = 0;
            }
            newLimits.maxValueIndex = newLimits.minValueIndex + numberOfBars;
            if (newLimits.maxValueIndex > totalBars) {
                newLimits.maxValueIndex = totalBars;
                newLimits.minValueIndex = newLimits.maxValueIndex - numberOfBars;
                if (newLimits.minValueIndex < 0) {
                    newLimits.minValueIndex = 0;
                }
            }

            xAxis.limits(newLimits);
        },

        onMoveGesture: function (object, eventType, eventObject) {
            if (object._barData && eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') {
                return this._onMoveGesture(object, eventType, eventObject);
            } else {
                return true;
            }
        },

        //onLeaveGesture: function (object, eventType, eventObject) {
        //    return this.onUpGesture(object, eventType, eventObject);
        //},


        _deccelerate: function (xAxis, barWidth, distance, numberOfBars, totalBars) {
            var timeLimits = xAxis.getActualLimits(),
                newLimits = {},
                displacement = Math.floor(distance / barWidth);

            newLimits.minValueIndex = timeLimits.minValueIndex - displacement;

            if (newLimits.minValueIndex < 0) {
                newLimits.minValueIndex = 0;
            }

            newLimits.maxValueIndex = newLimits.minValueIndex + numberOfBars;
            if (newLimits.maxValueIndex > totalBars) {
                newLimits.maxValueIndex = totalBars;
                newLimits.minValueIndex = newLimits.maxValueIndex - numberOfBars;
                if (newLimits.minValueIndex < 0) {
                    newLimits.minValueIndex = 0;
                }
            }

            xAxis.limits(newLimits);

            return displacement;
        },

        onUpGesture: function (object, eventType, eventObject) {
            if (object._barData) {
                var bag = object._calculationsBag,
                    speed = bag.speedN,
                    step, distance, i = 0, action,
                    chart = eventObject.chart,
                    xAxis = chart.xAxis(), timeLimits = xAxis.getActualLimits(),
                    chartWidth = chart.$chartElement().width(),
                    leftAxisWidth = chart.getViewPortLeftMargin(),
                    rightAxisWidth = chart.getViewPortRightMargin(),
                    numberOfBars = (timeLimits.maxValueIndex - timeLimits.minValueIndex),
                    totalBars = xAxis.totalRangeMax(),
                    barWidth = (chartWidth - leftAxisWidth - rightAxisWidth) / numberOfBars,
                    length, steps;

                if (speed > 0) {
                    steps = computeDesacceleration2(object._intervals, speed, -0.3 * Math.abs(bag.accelerationN), barWidth);
                } else {
                    steps = computeDesacceleration2(object._intervals, speed, 0.3 * Math.abs(bag.accelerationN), barWidth);
                }

                length = steps.length;

                object._barData = null;
                object._calculationsBag = null;
                //continue animation if no object._barData

                action = function () {
                    if (!object._barData && i < length) {
                        step = steps[i];

                        if (step.distance && step.distance !== NaN) {
                            distance = self._deccelerate(xAxis, barWidth, step.distance, numberOfBars, totalBars);

                            if (distance > 1 || distance < -1) {
                                i++;

                                //setTimeout(action, step.time);
                                setTimeout(action, 1);
                            }
                        }
                    }
                };

                action();

            }
            return true;
        },

        onEventCallback: function (object, eventType, eventObject) {
            var event, handler;
            event = 'on' + utilities.cap(eventType);
            handler = self[event];
            if (handler) {
                return handler.call(self, object, eventType, eventObject);
            } else {
                return true;
            }
        },

        dispose: function (object) {

            object.settings = null;
            object._intervals.length = 0;
            object._intervals = null;
            object._barData = null;
            object._calculationsBag = null;
        }
    };

    MomentumScrollerHelper.prototype.constructor = MomentumScrollerHelper;

    var self = new MomentumScrollerHelper();

    return self;
}
);