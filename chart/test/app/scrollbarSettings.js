define(function () {
    return function (chart) {

        var currentViewPortLeftMargin = 0,
            currentViewPortRightMargin = 65,
            prevViewPortLeftMargin = 0,
            prevViewPortRightMargin = 0,
            axis = (chart ? chart.xAxis : undefined),
            limits = (axis ? chart.xAxis().getActualLimits() : 0),
            totalRange = (axis ? chart.xAxis().totalRangeMax() : 0),
            isVisible = limits && totalRange > 0,
            isScrolling,
            scrollbar;

        return {
            setScrollbar: function(_scrollbar){
                scrollbar = _scrollbar;
            },
            totalRange:{
                minValue:0,
                maxValue:isVisible ? totalRange : 0
            },
            activeRange:{
                minValue:isVisible ? limits.minValueIndex : 0,
                maxValue:isVisible ? limits.maxValueIndex : 0
            },
            isVisible:isVisible,
            onBeginRangeChangeCallback:function () {
                isScrolling = true;
            },
            onRangeChangeCallback:function (range) {
                var actualLimits = chart.xAxis().getActualLimits();

                scrollbar.rightHandleMargin(currentViewPortRightMargin);

                if (range.minValue !== actualLimits.minValueIndex ||
                    range.maxValue !== actualLimits.maxValueIndex) {
                    chart.xAxis().limits({
                        minValueIndex:range.minValue,
                        maxValueIndex:range.maxValue
                    });
                }
            },
            onEndRangeChangeCallback:function () {
                isScrolling = false;
                if (prevViewPortRightMargin !== currentViewPortRightMargin) {
                    prevViewPortRightMargin = currentViewPortRightMargin;
                    scrollbar.rightHandleMargin(currentViewPortRightMargin);
                }

                if (prevViewPortLeftMargin !== currentViewPortLeftMargin) {
                    prevViewPortLeftMargin = currentViewPortLeftMargin;
                    scrollbar.leftHandleMargin(currentViewPortLeftMargin);
                }
            }
        };
    };
});
