define([
    'localLib/on',
    './IdentifiablePoint',
    './Pointer',
    './EventObject',
    './WheelEventObject',
    'common/RegionTypes'
], function(on, IdentifiablePoint, Pointer, EventObject, WheelEventObject, regionTypes){

    var
        wheelEventTypes = ['DOMMouseScroll', 'mousewheel'],
        pointersOne = [],
        pointersTwo = [],
        points = [],
        changedPoints = [],
        uidCount = 0;
        
    return function(instance, settings, element){

        var
            controls,
            handleId = 'mouseEvent-' + (uidCount++);

        function computeOffset (eventObject) {
            var offset = element.getBoundingClientRect();
            changedPoints.length = 1;
            changedPoints[0] = new IdentifiablePoint('0', eventObject.pageX - offset.left, eventObject.pageY - offset.top);
        }

        function mousedown(eventObject){
            eventObject.preventDefault();
            computeOffset(eventObject);
            instance._onDown(changedPoints, changedPoints, eventObject.which);
        }
        function mousemove(eventObject){
            eventObject.preventDefault();
            computeOffset(eventObject);
            instance._onMove(changedPoints, changedPoints, eventObject.which);
        }
        function mouseup(eventObject){
            eventObject.preventDefault();
            computeOffset(eventObject);
            points.length = 0;
            instance._onUp(points, changedPoints, eventObject.which);
        }

        function docMouseUp(eventObject) {
            if (eventObject.target === element || element.contains(eventObject.target)) {
                return true;
            }
            computeOffset(eventObject);
            points.length = 0;
            instance._onUp(points, changedPoints, eventObject.which);
            return true;
        }

        function mouseWheel(eventObject) {

            if (instance._slotWidth && changedPoints[0]) {
                eventObject.preventDefault();
                var
                    point = changedPoints[0],
                    region = instance._activeRegionsMap[point.id],
                    wheelEventObject;

                pointersTwo.length = 1;
                computeOffset(eventObject);
                
                pointersTwo[0] =
                    instance._createPointer(
                        point.id,
                        point.x,
                        point.y,
                        region && region.type !== regionTypes.xAxis ? region : null);

                wheelEventObject = new WheelEventObject(
                    pointersTwo,
                    eventObject.which,
                    eventObject.delta,
                    eventObject.deltaX,
                    eventObject.deltaY
                );

                instance._setBarSlotInfoToEventObject(wheelEventObject);

                settings.onWheelGestureCallback(wheelEventObject);
            }
        }

        on(element, 'wheel', mouseWheel, handleId);

        on(document, 'mouseup', docMouseUp, handleId);

        on.multi(element, {
           mousedown: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                instance._onDown(changedPoints, changedPoints, eventObject.which);
            },
            mousemove: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                instance._onMove(changedPoints, changedPoints, eventObject.which);
            },
            mouseup: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                points.length = 0;
                instance._onUp(points, changedPoints, eventObject.which);
            }
        }, handleId);



        controls = {
            getEvent: function(x, y){
                return {
                    preventDefault: function(){},
                    pageX: x,
                    pageY: y,
                    which: 1 // translates to "button" which is left or right click
                };
            },
            down: function(x, y){
                mousedown(this.getEvent(x,y));
            },
            move: function(x, y){
                mousemove(this.getEvent(x,y));
            },
            up: function(x, y){
                mouseup(this.getEvent(x,y));
            }
        };

        // NOT USED
        function triggerMoveGesture(pointers, button) {
            changedPoints.length = 1;
            var pointer = pointers[0];
            changedPoints[0] = new IdentifiablePoint(pointer.id, pointer.x, pointer.y);
            instance._onMove(changedPoints, changedPoints, button);
        }

        function triggerUpGesture(pointers, button) {
            changedPoints.length = 1;
            var pointer = pointers[0];
            changedPoints[0] = new IdentifiablePoint(pointer.id, pointer.x, pointer.y);
            points.length = 0;
            this._onUp(points, changedPoints, button);
        }

        instance.triggerGesture = function (type, data) {
            if (type === 'move') {
                triggerMoveGesture(data.pointers, data.button);
            } else if (type === 'up') {
                triggerUpGesture(data.pointers, data.button);
            } else {
                throw new Error('Not implemented');
            }
        };

        return {
            controls:controls,
            dispose: function(){
                on.remove(handleId);
            }
        };
    };
});
