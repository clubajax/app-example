define(
    [
        'plugins/interaction/VerticalZoom/VerticalZoomHelper'
    ], function (verticalZoomHelper) {
        //<summary>
        //  settings: {
        //  }
        //</summary>
        function VerticalZoom(settings) {
            verticalZoomHelper.init(this, settings);
        }

        VerticalZoom.prototype = {
            declaredClass:'VerticalZoom',
            onEventCallback: function (eventType, eventObject) {
                var regionType = (eventObject.changedPointers && eventObject.changedPointers[0] && eventObject.changedPointers[0].region && eventObject.changedPointers[0].region.type) ||
                    (eventObject.pointers && eventObject.pointers[0] && eventObject.pointers[0].region && eventObject.pointers[0].region.type);
                if (eventType !== "upGesture") {
                    if (regionType === 'rightAxis' || regionType === 'leftAxis') {
                        switch (eventType) {
                        case 'wheelGesture':
                            return verticalZoomHelper.onWheelGesture(this, eventType, eventObject);
                        case 'downGesture':
                            return verticalZoomHelper.onDownGesture(this, eventType, eventObject);
                        case 'upGesture':
                            return verticalZoomHelper.onUpGesture(this, eventType, eventObject);
                        case 'leaveGesture':
                            return verticalZoomHelper.onLeaveGesture(this, eventType, eventObject);
                        case 'moveGesture':
                            return verticalZoomHelper.onMoveGesture(this, eventType, eventObject);
                        default:
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return verticalZoomHelper.onUpGesture(this, eventType, eventObject);
                }
            },
            dispose: function () {
                verticalZoomHelper.dispose(this);
            }
        };

        VerticalZoom.prototype.constructor = VerticalZoom;

        return VerticalZoom;
    });
