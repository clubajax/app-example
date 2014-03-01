define(['chart/scalers/UniversalScaler'], function (UniversalScaler) {

    function LinearScaler(settings) {
        UniversalScaler.call(
            this,
            $.extend(
                settings, {
                    valueFunction: function(value) {
                        return value;
                    },
                    inverseFunction: function(value) {
                        return value;
                    }
                }
            )
        );
    }

    LinearScaler.prototype = {
        dispose: function() {
            UniversalScaler.call.dispose(this);
        }
    };

    LinearScaler.prototype.constructor = LinearScaler;

    return LinearScaler;
});