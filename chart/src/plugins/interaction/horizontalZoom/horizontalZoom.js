define(
    [
        'plugins/interaction/HorizontalZoom/HorizontalZoomHelper'
    ], function (HorizontalZoomHelper) {
    //<summary>
    //  settings: {
    //  }
    //</summary>
    function HorizontalZoom(settings) {
        HorizontalZoomHelper.init(this, settings);
    }

    HorizontalZoom.prototype = {
        onEventCallback: function (eventType, eventObject) {
            return HorizontalZoomHelper.onEventCallback(this, eventType, eventObject);
        },
        dispose: function () {
            HorizontalZoomHelper.dispose(this);
        }
    };

    HorizontalZoom.prototype.constructor = HorizontalZoom;

    return HorizontalZoom;
});