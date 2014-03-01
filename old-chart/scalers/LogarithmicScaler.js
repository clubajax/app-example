define(['chart/scalers/UniversalScaler'], function (UniversalScaler) {
    function LogarithmicSaler(settings) {
        UniversalScaler.call(this,
            $.extend(
                settings, {
                    valueFunction: function(value) { return Math.log(value) / Math.LN10; },
                    inverseFunction: function (value) { return Math.pow(10, value); }
                }
            )
        );
    }

    LogarithmicSaler.prototype = {
        dispose: function () {
            UniversalScaler.dispose.call(this);
        }
    };

    LogarithmicSaler.prototype.constructor = LogarithmicSaler;

    return LogarithmicSaler;
});