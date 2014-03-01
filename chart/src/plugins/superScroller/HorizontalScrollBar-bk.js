define([
    'dcl/dcl',
    'common/Base',
    'common/Utilities',
    'plugins/SuperScroller/SuperScroller'
], function (dcl, Base, utilities, SuperScroller) {

    var
    $ = window.$,

    HorizontalScrollBar = dcl(Base, {
        declaredClass:'HorizontalScrollBar',
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
            leftHandleMargin: 14,
            rightHandleMargin: 16
        },
        constructor: function(settings, node){
            if(utilities.isNode(settings)){
                console.error('Parameters are not correct');
            }

            this.domNode = utilities.dom('div', {css:'ui-ss-host'}, node);

            this.scrollbar = new SuperScroller($(this.domNode), {
                totalRange: this.totalRange(),
                activeRange: this.activeRange()
            });

            this.activeRange.subscribe(function(value){
                this.scrollbar.activeRange(value);
            }, this);

            this.totalRange.subscribe(function(value){
                this.scrollbar.totalRange(value);
            }, this);

            this.isVisible.subscribe(function(value){
                if (value) {
                    utilities.show(this.domNode);
                } else {
                    utilities.hide(this.domNode);
                }
            }, this);

            this.own(this.scrollbar.isScrolling.subscribe(function (value) {
                if (value && settings.onBeginRangeChangeCallback) {
                    settings.onBeginRangeChangeCallback.call(this);
                } else if(!value && settings.onEndRangeChangeCallback) {
                    settings.onEndRangeChangeCallback.call(this);
                }
            }, this));

            this.own(this.scrollbar.activeRange.subscribe(function (value) {
                if(settings.onRangeChangeCallback){
                    value.minValue = Math.ceil(value.minValue);
                    value.maxValue = Math.ceil(value.maxValue);
                    settings.onRangeChangeCallback.call(this, value);
                }
            }, this));

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
