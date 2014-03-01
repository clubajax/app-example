define([
    'dcl/dcl',
    'common/Base',
    'common/Utilities',
    './SuperScroller',
    './HorizontalZoom'
], function (dcl, Base, utilities, SuperScroller, HorizontalZoom) {

    var
    $ = window.$,

    HorizontalScrollBar = dcl(Base, {
        declaredClass:'HorizontalScrollBar',
        pluginName:'scrollbar',
        observables:{
            totalRange: {
                minValue: 0,
                maxValue: 1
            },
            activeRange: {
                minValue: 1,
                maxValue: 1
            },
            isVisible:true,
            leftHandleMargin: 0,
            rightHandleMargin: 0
        },

        broker: null,

        constructor: function(settings, node){
            if(utilities.isNode(settings)){
                console.error('Parameters are reversed');
            }

            this.domNode = utilities.dom('div', {css:'ui-ss-host'}, node);

            this.init();
        },

        init: function(){
            if(!this.broker.chart){
                throw new Error('Chart not set in broker');
            }
            var
                chart = this.broker.chart,
                axis = chart.xAxis(),
                limits = axis.getActualLimits(),
                totalRange = axis.totalRangeMax();

            this.totalRange({
                minValue: 0,
                maxValue: totalRange
            });
            
            if(limits){
                this.activeRange({
                    minValue: limits.minValueIndex,
                    maxValue: limits.maxValueIndex
                });
            }
            
            this.scrollbar = new SuperScroller($(this.domNode), {
                totalRange: [this.totalRange().minValue, this.totalRange().maxValue],
                activeRange: [this.activeRange().minValue, this.activeRange().maxValue]
            });

            this.zoom = new HorizontalZoom({});
            this.broker.add(this.zoom);

            this.zoom.on('range', function(range){
                this.scrollbar.activeRange([range.minValue, range.maxValue]);
            }, this);

            this.activeRange.subscribe(function(value){
                this.scrollbar.activeRange([value.minValue, value.maxValue]);
            }, this);

            this.totalRange.subscribe(function(value){
                this.scrollbar.totalRange([value.minValue, value.maxValue]);
            }, this);

            this.isVisible.subscribe(function(value){
                if (value) {
                    utilities.show(this.domNode);
                } else {
                    utilities.hide(this.domNode);
                }
            }, this);

            this.own(this.scrollbar.activeRange.subscribe(function (value) {
                var
                    range = {
                        minValue: Math.ceil(value[0]),
                        maxValue: Math.ceil(value[1])
                    },
                    actualLimits = chart.xAxis().getActualLimits();

                if (range.minValue !== actualLimits.minValueIndex || range.maxValue !== actualLimits.maxValueIndex) {
                    chart.xAxis().limits({
                        minValueIndex: range.minValue,
                        maxValueIndex: range.maxValue
                    });
                }
            }, this));

            this.own(chart.on(chart.events.limits, function(newLimits){
                var
                    actualLimits = newLimits.limits,
                    totalRange = newLimits.total,
                    currentRange;

                if (totalRange) {
                    if (actualLimits) {
                        currentRange = this.totalRange().maxValue;

                        //to avoid multiple changes, we check first.
                        if (actualLimits.maxValueIndex < currentRange) {
                            this.activeRange({ minValue: actualLimits.minValueIndex, maxValue: actualLimits.maxValueIndex });
                            this.totalRange({ minValue: 0, maxValue: totalRange });
                        } else {
                            this.totalRange({ minValue: 0, maxValue: totalRange });
                            this.activeRange({ minValue: actualLimits.minValueIndex, maxValue: actualLimits.maxValueIndex });
                        }
                        if(!this.isVisible()){
                            this.isVisible(true);
                        }
                    } else {
                        this.isVisible(false);
                    }
                } else {
                    this.isVisible(false);
                }

            }, this));

            // I don't think these are used in the app
            // and I'm not sure the CSS is correct anyway
            this.leftHandleMargin.subscribe(function(value){
                this.scrollbar.leftHandleMargin(value);
            }, this);

            this.rightHandleMargin.subscribe(function(value){
                this.scrollbar.rightHandleMargin(value);
            }, this);
        },

        changeRanges: function (iTotalRange, iActiveRange) {
            //console.log(' ~~~~ changeRanges', iTotalRange, iActiveRange);
            var
                totalSpan = iTotalRange && iTotalRange.maxValue - iTotalRange.minValue,
                currentRange = this.activeRange(),
                activeSpan = currentRange && currentRange.maxValue - currentRange.minValue;

            if (totalSpan < activeSpan) {
                this.activeRange(iActiveRange);
                this.totalRange(iTotalRange);
            } else {
                this.totalRange(iTotalRange);
                this.activeRange(iActiveRange);
            }
        },

        reset: function () {
            console.warn('HorizontalScrollBar.reset not implemented');
            //TEST ME
            // not sure this is correct, since the range changes with live data
            //this.changeRanges(orgTotalRange, orgActiveRange);
        },

        resize: function(){
            this.scrollbar.resize.apply(this.scrollbar, arguments);
        },

        dispose: function () {
            this.activeRange = null;
            this.totalRange = null;
            this.scrollbar.dispose();
            this.scrollbar = null;
            utilities.destroy(this.domNode);
            this.domNode = null;
        }
    });

    return HorizontalScrollBar;


});
