define([], function() {

    function Rect(top, left, bottom, right) {
        return {
            top: top || 0,
            left: left || 0,
            bottom: bottom || 0,
            right: right || 0
        };
    }

    return Rect;
});