define(['common/Utilities'], function (utilities) {


    function UniversalScaler(settings) {
        var valueFunction = settings.valueFunction,
            inverseFunction = settings.inverseFunction,
            fMax, fMin, height, top, deltaF, limits, isLimits = false,
             m, n;

        limits = settings.valueLimits;

        if (limits) {
            fMax = valueFunction(limits.maxValue);
            fMin = valueFunction(limits.minValue);
            deltaF = fMax - fMin;
        }

        limits = settings.positionLimits;

        if (limits) {
            height = limits.maxValue - limits.minValue;
            top = limits.minValue;
        }

        function calculateInverseParameters() {
            n = fMin + deltaF + top * deltaF / height;
            m = -deltaF / height;
        }

        if (settings.valueLimits && limits) {
            calculateInverseParameters();
        }

        this.valueLimits = utilities.settingProperty(settings, "valueLimits",
            function (newValue) {
                isLimits = !!newValue;

                if (isLimits) {
                    fMax = valueFunction(newValue.maxValue);
                    fMin = valueFunction(newValue.minValue);
                    deltaF = fMax - fMin;
                    calculateInverseParameters();
                }
            }
        );

        this.isLimits = function (islimits) {
            if (arguments.length) {
                isLimits = islimits;
            }
            return isLimits;
        };

        this.positionLimits = utilities.settingProperty(settings, "positionLimits",
            function (newValue) {
                height = newValue.maxValue - newValue.minValue;
                top = newValue.minValue;
                calculateInverseParameters();
            }
        );

        this.calculate = function (value) {
            return top + height * (1 - (valueFunction(value) - fMin) / deltaF);
        };

        this.inverse = function (pixel) {
            return inverseFunction(pixel * m + n);
        };

        this.dispose = function () {
            this.valueLimits = null;
            this.positionLimits = null;
        };
    }

    return UniversalScaler;
});
