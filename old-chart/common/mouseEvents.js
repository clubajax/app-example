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
        
    return function(renderer, settings, element){

        var handleId = 'mouseEvent-' + (uidCount++);

        function computeOffset (eventObject) {
            var offset = element.getBoundingClientRect();
            changedPoints.length = 1;
            changedPoints[0] = new IdentifiablePoint('0', eventObject.pageX - offset.left, eventObject.pageY - offset.top);
        }

        function triggerMoveGesture(pointers, button) {
            changedPoints.length = 1;
            var pointer = pointers[0];
            changedPoints[0] = new IdentifiablePoint(pointer.id, pointer.x, pointer.y);
            renderer._onMove(changedPoints, changedPoints, button);
        }

        function triggerUpGesture(pointers, button) {
            changedPoints.length = 1;
            var pointer = pointers[0];
            changedPoints[0] = new IdentifiablePoint(pointer.id, pointer.x, pointer.y);
            points.length = 0;
            this._onUp(points, changedPoints, button);
        }

        function docMouseUp(eventObject) {
            if (eventObject.target !== element) {
                computeOffset(eventObject);
                points.length = 0;
                renderer._onUp(points, changedPoints, eventObject.which);
            }
        }

        function mouseWheel(eventObject) {

            if (renderer._slotWidth && changedPoints[0]) {
                eventObject.preventDefault();
                var
                    point = changedPoints[0],
                    region = renderer._activeRegionsMap[point.id],
                    wheelEventObject;

                pointersTwo.length = 1;
                computeOffset(eventObject);
                
                pointersTwo[0] =
                    renderer._createPointer(
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

                renderer._setBarSlotInfoToEventObject(wheelEventObject);

                settings.onWheelGestureCallback(wheelEventObject);
            }
        }

        on(element, 'wheel', mouseWheel, handleId);

        on(document, 'mouseup', docMouseUp, handleId);

        on.multi(element, {
           mousedown: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                renderer._onDown(changedPoints, changedPoints, eventObject.which);
            },
            mousemove: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                renderer._onMove(changedPoints, changedPoints, eventObject.which);
            },
            mouseup: function (eventObject) {
                eventObject.preventDefault();
                computeOffset(eventObject);
                points.length = 0;
                renderer._onUp(points, changedPoints, eventObject.which);
            }
        }, handleId);

        renderer.triggerGesture = function (type, data) {
            if (type === 'move') {
                triggerMoveGesture(data.pointers, data.button);
            } else if (type === 'up') {
                triggerUpGesture(data.pointers, data.button);
            } else {
                throw new Error('Not implemented');
            }
        };

        return {
            dispose: function(){
                on.remove(handleId);
            }
        };
    };
});
