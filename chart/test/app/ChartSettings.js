define([
    './colors',
    'chart/SeriePainters/SeriePainterFactory',
    'plugins/resourceManager/ResourceManager',
    './SubGraphSettings'
], function (colors, SeriePainterFactory, ResourceManager, SubGraphSettings) {
    return function ChartSettings(broker) {
        var
            touchEnabled = false,//( !!window.ontouchstart ) ||  ( window.DocumentTouch && document instanceof DocumentTouch ),
            userInteractionType = touchEnabled ? 'mobile' : 'desktop',
            scrollbar;

        return {
            painterFactory:SeriePainterFactory,
            resourceManager:ResourceManager,
            userInteractionType:userInteractionType,
            onEventCallback:function (eventType, eventObject) {
                return broker.onEventCallback(eventType, eventObject);
            },
            setScrollbar: function(_scrollbar){
                scrollbar = _scrollbar;
            },
            style:{
                backgroundColor: colors.chart.background.color,
                axes:{
                    color: colors.chart.axes.axisColor,
                    width:1
                },
                label:{
                    color: colors.chart.axes.labelColor,
                    font:"normal 11px AramidBook"
                },
                grid:{
                    intraDayColor: colors.chart.grid.verticalIntraDayColor,
                    noIntraDayColor: colors.chart.grid.verticalColor,
                    horizontalColor: colors.chart.grid.horizontalColor,
                    width:1
                },
                crosshair:{
                    draw:{
                        color: colors.chart.crosshair.color,
                        width:1
                    },
                    indication:{
                        color: colors.chart.crosshair.labelColor,
                        font:'normal 11px AramidBook'
                    }
                }
            },
            xAxis:{
                limits:'auto',
                maximumNumberOfVisibleBars:60,
                minimumNumberOfVisibleBars:5,
                showLabels:true,
                showVerticalLines:true,
                onLimitsChanged:function (newLimits) {
                    var actualLimits = newLimits.limits,
                        totalRange = newLimits.total,
                        currentRange;
                    if (totalRange) {
                        if (actualLimits) {
                            currentRange = scrollbar.totalRange().maxValue;

                            //to avoid multiple changes, we check first.
                            if (actualLimits.maxValueIndex < currentRange) {
                                scrollbar.activeRange({
                                    minValue:actualLimits.minValueIndex,
                                    maxValue:actualLimits.maxValueIndex
                                });

                                scrollbar.totalRange({
                                    minValue:0,
                                    maxValue:totalRange
                                });
                            } else {
                                scrollbar.totalRange({
                                    minValue:0,
                                    maxValue:totalRange
                                });

                                scrollbar.activeRange({
                                    minValue:actualLimits.minValueIndex,
                                    maxValue:actualLimits.maxValueIndex
                                });
                            }
//                            !scrollbar.isVisible() &&
                            scrollbar.isVisible(true);
                        } else {
                            scrollbar.isVisible(false);
                        }
                    } else {
                        scrollbar.isVisible(false);
                    }
                }
            },
            graphs:[new SubGraphSettings()],
            onViewPortLeftMarginChange:function (margin) {
                scrollbar.leftHandleMargin(margin);
            },
            onViewPortRightMarginChange:function (margin) {
                scrollbar.rightHandleMargin(margin);
            }
        };
    };
});
