// NOT USED
// USE PROFILE
define([
    'plugins/interaction/broker/broker',
    'plugins/interaction/datatip/Datatip',
    'plugins/interaction/crosshair/Crosshair',
    'plugins/interaction/drawing/DrawingCreator',
    'plugins/interaction/graphResizing/graphResizing',
    'plugins/interaction/horizontalZoom/horizontalZoom',
    // errors out, and is not used:
    'plugins/resourceManager/ResourceManager',
    'plugins/interaction/selection/Selection',
    'plugins/statusLine/statusRenderer',
    'plugins/superScroller/HorizontalScrollBar',
    'plugins/interaction/verticalZoom/verticalZoom',
    'lib/i18n'

], function (broker) {
    return {
        broker: broker
    };
});
