define(
    [
        'plugins/interaction/momentumScrolling/momentumScrollerHelper'
    ], function(momentumScrollerHelper) {

        //<summary>
        //  settings: {
        //  }
        //</summary>

        function momentumScroller(settings) {
            momentumScrollerHelper.init(this, settings);
        }

        momentumScroller.prototype = {
            onEventCallback: function(eventType, eventObject) {
                return momentumScrollerHelper.onEventCallback(this, eventType, eventObject);
            },
            
            dispose: function() {
                momentumScrollerHelper.dispose(this);
            }
        };

        momentumScroller.prototype.constructor = momentumScroller;

        return momentumScroller;
    }
);