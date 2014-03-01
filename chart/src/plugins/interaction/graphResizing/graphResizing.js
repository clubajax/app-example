//<summary>
//  settings: {
//      minHeight: @number (px)
//      minHeight: @number (px)
//  }
//</summary>

define(
    [
        'plugins/interaction/graphResizing/graphResizingHelper'
    ], function (graphResizingHelper) {
        
        function GraphResizing(settings) {
            graphResizingHelper.init(this, settings);
        }

        GraphResizing.prototype = {

            onEventCallback: function (eventType, eventObject) {
                switch (eventType) {
                    case "moveGesture":
                        return graphResizingHelper.onMoveGesture(this, eventObject);
                    case "upGesture":
                        return graphResizingHelper.onUpGesture(this, eventObject);
                    default:
                        return true;
                }
            },

            dispose: function () {
                graphResizingHelper.dispose(this);
            }
        };

        GraphResizing.prototype.constructor = GraphResizing;

        return GraphResizing;
    }
);