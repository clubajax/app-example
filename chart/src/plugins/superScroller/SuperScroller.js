define([
    'common/Utilities',
    'knockout',
    'localLib/mouse',
    'localLib/on'
], function (utilities, ko, mouse, on) {

    var
        $ = window.$,
        jumpScrollInterval,
        jumpScrollX,
        jumpScrollAmount = 30,
        jumpScrollTime = 300,
        stopJumpScroll = function(){
            clearInterval(jumpScrollInterval);
            jumpScrollInterval = 0;
        },
        mouseHandled = false,
        defaultOptions = {
            totalRange: [0, 0],
            activeRange: [0, 0],
            step: 1,
            pageStep: 5,
            minimumRange: 1,
            cancel: ':input,option'
        },

        noop = function(){};

        // TODO: impl destroy

    function SuperScroller(parent, options) {

        this.widgetName = 'SuperScroller';

        this.options = utilities.mixin(true, {}, defaultOptions, options);

        this.totalRange = ko.observable(this.options.totalRange);

        this.activeRange = ko.observable(this.options.activeRange);

        this.disabled = ko.observable(this.options.disabled ? true : false);


        this.isScrolling = ko.observable(false);

        this.settings = this.options;

        delete this.options;

        this.$parent = parent;
        this.parentNode = parent.get(0);
        this.create();

        this.initSubscriptions();
    }

    SuperScroller.prototype = {
        pluginName:'scroller',
        initSubscriptions: function(){
            this.totalRange.subscribe(function (newValue) {
                this.positionDom();
            }.bind(this));
            this.activeRange.subscribe(function (newValue) {
                this.positionDom();
            }.bind(this));

            var
                self = this,
                winDebounce;

            // need to use the global jQuery here to listen to pseudo events
            $(window).on('resize', function(){
                // maintain a large timeout to give the parent chart time to redraw
                // currently unaware of any events or tickle-down resize commands
                clearTimeout(winDebounce);
                winDebounce = setTimeout(self.positionDom.bind(self), 100);
            });
        },

        activeRangeQuiet: function(range){
            this.isSettingRange = true;
            this.activeRange(range);
            this.isSettingRange = false;
        },

        resize: function(){
            this.positionDom();
        },

        mouseInit: function () {
            mouse.track(this.parentNode, {
                down: 'onMouseDown',
                up: 'onMouseUp',
                move: 'onMouseMove'
            }, this);
            this.started = false;
            this.action = noop;
        },

        dispose: function () {
            //
        },

        onMouseDown: function (event) {
            //console.log('down', event.target);
            var hotNode = event.target;

            if(hotNode === this.scroller){
                this.action = this.moveRange.bind(this);
            }
            else if(hotNode === this.handleLft){
                this.action = this.moveLeftHandle.bind(this);
            }
            else if(hotNode === this.handleRgt){
                this.action = this.moveRightHandle.bind(this);
            }
            else if(hotNode === this.parentNode){
                this.action = this.jumpScroll.bind(this);
                this.jumpScroll(event.mouse.x);
            }
            this.isScrolling(true);

        },

        onMouseMove: function (event) {
            //console.log('move', event.mouse);
            var x = event.mouse.last.x;
            this.action(x);
        },

        onMouseUp: function (event) {
            this.action = noop;
            stopJumpScroll();
            this.isScrolling(false);
            return false;
        },


        create: function () {
            // spans upset the click target
            // screw that - fix it in css
            this.scroller = document.createElement('div');
            this.scroller.className = 'ui-ss-scroller';
            this.handleLft = document.createElement('a');
            this.handleLft.className = 'ui-ss-handle left';
            //this.handleLft.appendChild(document.createElement('span'));
            this.scroller.appendChild(this.handleLft);
            this.handleRgt = document.createElement('a');
            this.handleRgt.className = 'ui-ss-handle right';
            //this.handleRgt.appendChild(document.createElement('span'));
            this.scroller.appendChild(this.handleRgt);
            this.$parent.append(this.scroller);
            this.$scroller = $(this.scroller);

            this.handleWidth = 18; // TODO - measure dis

            this.positionDom();

            this.mouseInit();

        },


        moveRightHandle: function(px){
            var
                amt,
                //tl = this.totalRange()[0],
                tr = this.totalRange()[1],
                al = this.activeRange()[0],
                ar = this.activeRange()[1],
                unit = this.pixelsToUnits(px);

            if(unit + ar > tr){
                amt = tr;
            }else if(unit + ar < al){
                amt = al;
            }else{
                amt = ar + unit;
            }
            amt = Math.min(amt, this.totalRange()[1]);
            this.activeRange([al, amt]);
        },

        moveLeftHandle: function(px){
            var
                amt,
                tl = this.totalRange()[0],
                //tr = this.totalRange()[1],
                al = this.activeRange()[0],
                ar = this.activeRange()[1],
                unit = this.pixelsToUnits(px);

            if(unit + al < tl){
                amt = tl;
            }else if(unit + al > ar){
                amt = ar;
            }else{
                amt = al + unit;
            }
            amt = Math.max(amt, this.totalRange()[0]);
            this.activeRange([amt, ar]);
        },

        moveRange: function(px){
            var
                tl = this.totalRange()[0],
                tr = this.totalRange()[1],
                al = this.activeRange()[0],
                ar = this.activeRange()[1],
                r = ar - al,
                units = this.pixelsToUnits(px);

            if(units + al < tl){
                this.activeRange([tl, tl + r]);
            }else if(units + ar > tr){
                this.activeRange([tr - r, tr]);
            }else{
                this.activeRange([al + units, ar + units]);
            }

            this.positionDom();

        },

        jumpScroll: function(px){
            jumpScrollX = px;
            if(jumpScrollInterval){
                return; // in progress
            }

            var move = function(){
                var
                    amt,
                    tl = this.totalRange()[0],
                    tr = this.totalRange()[1],
                    al = this.activeRange()[0],
                    ar = this.activeRange()[1],
                    unit = this.pixelsToUnits(jumpScrollX);

                if(unit < al){
                    amt = al - jumpScrollAmount < tl ? tl - al : jumpScrollAmount * -1;
                }else if(unit > ar){
                    amt = ar + jumpScrollAmount > tr ? tr - ar : jumpScrollAmount;
                }else{
                    clearInterval(jumpScrollInterval);
                    jumpScrollInterval = 0;
                    stopJumpScroll();
                    return;
                }

                if(Math.abs(amt) < jumpScrollAmount){
                    stopJumpScroll();
                }

                this.activeRange([al + amt, ar + amt]);
                this.positionDom();
            }.bind(this);

            jumpScrollInterval = setInterval(move, jumpScrollTime);
            move();
        },

        pixelsToUnits: function(px){
            var
                range = this.totalRange()[1] - this.totalRange()[0],
                w = this.$parent.width() - this.handleWidth;

            return px * (range / w);
        },

        positionDom: function(){
            var
                hw = this.handleWidth,
                //tl = this.totalRange()[0],
                tr = this.totalRange()[1],
                al = this.activeRange()[0],
                ar = this.activeRange()[1],
                //wp = (ar - al) / (tr - tl),
                lp = al / tr,
                rp = ar / tr,
                w = this.$parent.width(),

                left = lp * (w - (2 * hw)),
                right = rp * w + (2 * hw * (1 - rp)) ; // inverse handle 2x width

            this.$scroller.css("width", (right - left) + "px");
            this.$scroller.css("left", left + "px");
        },

        leftHandleMargin: function (value) {
            if (value < this.settings.minLeftHandleMargin) {
                value = this.settings.minLeftHandleMargin;
            }
            utilities.style(this.scroller, 'margin-left', value + 'px');
        },

        rightHandleMargin: function (value) {
            if (value < this.settings.minRightHandleMargin) {
                value = this.settings.minRightHandleMargin;
            }
            utilities.style(this.scroller, 'margin-right', value + 'px');
        }
    };

    return SuperScroller;
});
