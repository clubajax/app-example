define([
    'dcl/dcl',
    '../defaults',
    'jquery',
    'common/Utilities',
    '../graph/GraphList',
    '../axes/XAxisRenderer',
    'common/Rect',
    'chart/axes/YAxisPosition',
    'common/RegionTypes',
    'localLib/logger'
], function (dcl, defaults, $, utilities, GraphList, XAxisRenderer, rect, yAxisPosition, regionTypes, logger) {

    var
        loggingEnabled = 0,
        log = logger('R', loggingEnabled, 'Chart Renderer'),
        pointersOne = [],
        pointersTwo = [],
        points = [],
        changedPoints = [];
    
    return dcl(null, {
        declaredClass:'Renderer',
        constructor: function($parent, settings, chart) {

            if(loggingEnabled){
                window.renderer = this;
            }
            var
                wrapperNode,
                minZOrder = settings.minZOrder || 1,
                maxZOrder = settings.maxZOrder || 50,
                element,
                subGraphZOrderMax = maxZOrder - 1,
                xAxisZOrder = minZOrder,
                i,
                self = this;

            this.eventTree = settings.eventTree;
            this.chart = chart;
            this.lastDataAmountRendered = 0;
            this.settings = settings;
            this.$parent = $parent;
            minZOrder += 1;

            // fix this noiz
            this.subGraphZOrderMax = subGraphZOrderMax;
            this.minZOrder = minZOrder;


            
            this.domNode = utilities.dom('div', {
                css:defaults.chart.className,
                style:{
                    //zIndex:utilities.zindex('chart'),
                    position:'relative',
                    userSelect: 'none',
                    left: '0px',
                    top:'0px',
                    backgroundColor: settings.theme.backgroundColor
                }
            }, $parent);

            this.watermarkNode = utilities.dom('div', {
                css:'watermark',
                style:{
                    zIndex:1,
                    position:'absolute',
                    userSelect: 'none',
                    left: '0px',
                    top:'0px'
                }
            }, this.domNode);

            wrapperNode = utilities.dom('div', {css:'watermarkWrapper'}, this.watermarkNode);
            this.watermarkSymbolNode = utilities.dom('div', {css:'watermarkSymbol'}, wrapperNode);
            this.watermarkIntervalNode = utilities.dom('div', {css:'watermarkInterval'}, wrapperNode);

            settings.theme.on('change', function(theme){
                utilities.style(this.domNode, 'backgroundColor', theme.backgroundColor);
            }, this);

            this._$domElement = $(this.domNode);
            this.id = settings.id;

            this._timeRect = rect();

            this._timeRegion = {
                rect: rect(),
                type: regionTypes.xAxis
            };

            this.xAxis = new XAxisRenderer(this.domNode, {
                theme:settings.theme,
                resourceManager: settings.resourceManager,
                showLabels: settings.timeAxis.showLabels,
                showVerticalLines: settings.timeAxis.showVerticalLines,
                labelAxisDistance: settings.timeAxis.labelAxisDistance,
                labelBorderDistance: settings.timeAxis.labelBorderDistance,
                markerLength: settings.timeAxis.markerLength,
                minLabelDistance: settings.timeAxis.minLabelDistance,
                axisHeight: 0,
                zOrder: xAxisZOrder,
                leftLabelsLimit: 0,
                rightLabelsLimit: 0,
                indexedData: settings.indexedData,
                rect: this._timeRect
            });

            this._timeAxisHeight = this.xAxis.computeRecommendedHeight();
            this.xAxis.axisHeight(this._timeAxisHeight);

            this._viewPort = [];
            this._width = 0;
            this._height = 0;
            this._slotWidth = 0;
            this._rightYAxisWidth = 0;
            this._leftYAxisWidth = 0;
            this._selectedTargetRenderer = null;


            this.graphs = new GraphList({
                renderer:this,
                eventTree:this.eventTree,
                indexedData: this.settings.indexedData,
                painterFactory: this.settings.painterFactory,
                leftAxisWidth: this._leftYAxisWidth,
                rightAxisWidth: this._rightYAxisWidth,
                theme:this.settings.theme
            }, this.domNode);

            this.eventTree.on(this.eventTree.events.addGraph, this.onAddGraph, this);
            this.eventTree.on(this.eventTree.events.removeGraph, this.onRemoveGraph, this);
            
            //this.graphs.add(settings.subGraphs);

            if ($parent.height() || $parent.width()) {
                 // can't have this trigger a render before the
                 // Renderer object is completely instanciated
                 window.requestAnimationFrame(this.resize.bind(this));
            }
        },

        subGraphs: function(index){
            return this.graphs.get(index);
        },
        
        onAddGraph: function (event) {
            console.log('REND ADD GRAPH');
            var adjustment = this._computeSubGraphVerticalLimits([]);

            if (this._width && this._height) {
                this._adjustSubGraphVerticalLimtis(this, adjustment);
                this._computeViewPort();
            } else {
                this._adjustSubGraphVerticalLimtis([], adjustment);
            }
            this.render();
        },

        onRemoveGraph: function (event) {
            console.log('REND REM');
            this.render();
        },

        setWatermark: function(options){
            if(options.symbol){
                this.watermarkSymbolNode.innerHTML = options.symbol;
            }
            if(options.interval){
                this.watermarkIntervalNode.innerHTML = options.interval;
            }
        },

        _computeViewPort: function () {
            //log('_computeViewPort (viewPortSlot!)');
            if (this.settings.indexedData.data.length) {

                var
                    i = 0,
                    viewPort = this._viewPort,
                    indexedData = this.settings.indexedData,
                    dataLength = indexedData.data.length,
                    beginIndex = indexedData.beginIndex,
                    endIndex = indexedData.endIndex,
                    left = this._leftYAxisWidth,
                    slotWidth,
                    halfSlotWidth, slot,
                    currentViewPortSize = viewPort.length,
                    newViewPortSize = this.viewPortSize;

                // UGH! Why change this var?
                indexedData = indexedData.data;

                if (beginIndex) {
                    indexedData[beginIndex - 1].viewPortSlot = null;
                }

                if (endIndex <= indexedData.length - 2) {
                    indexedData[endIndex + 1].viewPortSlot = null;
                }

                slotWidth = (this._width - this._rightYAxisWidth - left) / newViewPortSize;

                if (newViewPortSize < currentViewPortSize) {
                    viewPort.splice(newViewPortSize - 1, currentViewPortSize - newViewPortSize);

                    currentViewPortSize = newViewPortSize;
                }

                this._slotWidth = slotWidth;
                halfSlotWidth = slotWidth / 2;
                left = 0;

                while (i < currentViewPortSize) {

                    slot = viewPort[i];

                    slot.left = left;
                    slot.center = left + halfSlotWidth;
                    slot.right = left + slotWidth;
                    if (beginIndex < dataLength) {
                        indexedData[beginIndex].viewPortSlot = slot;
                    }

                    left += slotWidth;
                    beginIndex++;
                    i++;
                }

                while (i < newViewPortSize) {
                    slot = {};

                    viewPort.push(slot);

                    slot.left = left;
                    slot.center = left + halfSlotWidth;
                    slot.right = left + slotWidth;

                    if (beginIndex <= endIndex) {
                        indexedData[beginIndex].viewPortSlot = slot;
                    }

                    left += slotWidth;
                    beginIndex++;
                    i++;
                }
            }
        },

        _associateViewPort: function () {

            var
                i = 0,
                indexedData = this.settings.indexedData,
                viewPort = this._viewPort,
                beginIndex = indexedData.beginIndex,
                endIndex = indexedData.endIndex,
                data = indexedData.data;

            if (beginIndex) {
                data[beginIndex - 1].viewPortSlot = null;
            }

            if (endIndex <= data.length - 2) {
                data[endIndex + 1].viewPortSlot = null;
            }

            while (beginIndex <= endIndex) {
                data[beginIndex].viewPortSlot = viewPort[i];
                beginIndex++;
                i++;
            }
        },

        _computeSubGraphVerticalLimits: function (subGraphs, positionToAdjust) {

            var
                length = subGraphs.length,
                yScaleGroupRenderer,
                subGraph,
                rAxisWidth = 0,
                lAxisWidth = 0,
                verticalLimitsAdjusted = {
                    rightLimitAdjusted: false,
                    leftLimitAdjusted: false
                };

            if (positionToAdjust === yAxisPosition.right) {
                verticalLimitsAdjusted.rightLimitAdjusted = false;

                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                    yScaleGroupRenderer = subGraph.yScaleGroupRight;
                    if (yScaleGroupRenderer && yScaleGroupRenderer.limitsMaxWidth > rAxisWidth) {
                        rAxisWidth = yScaleGroupRenderer.limitsMaxWidth;
                    }
                }

                if (this._rightYAxisWidth !== rAxisWidth) {
                    this._rightYAxisWidth = rAxisWidth;
                    verticalLimitsAdjusted.rightLimitAdjusted = true;
                }

            } else if (positionToAdjust === yAxisPosition.left) {
                verticalLimitsAdjusted.leftLimitAdjusted = false;
                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                    yScaleGroupRenderer = subGraph.yScaleGroupLeft;
                    if (yScaleGroupRenderer && yScaleGroupRenderer.limitsMaxWidth > lAxisWidth) {
                        lAxisWidth = yScaleGroupRenderer.limitsMaxWidth;
                    }
                }

                if (this._leftYAxisWidth !== lAxisWidth) {
                    this._leftYAxisWidth = lAxisWidth;
                    verticalLimitsAdjusted.leftLimitAdjusted = true;
                }

            } else {

                verticalLimitsAdjusted.rightLimitAdjusted = false;
                verticalLimitsAdjusted.leftLimitAdjusted = false;

                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {

                    yScaleGroupRenderer = subGraph.yScaleGroupLeft;

                    if (yScaleGroupRenderer && yScaleGroupRenderer.limitsMaxWidth > lAxisWidth) {
                        lAxisWidth = yScaleGroupRenderer.limitsMaxWidth;
                    }

                    yScaleGroupRenderer = subGraph.yScaleGroupRight;

                    if (yScaleGroupRenderer && yScaleGroupRenderer.limitsMaxWidth > rAxisWidth) {
                        rAxisWidth = yScaleGroupRenderer.limitsMaxWidth;
                    }
                }

                if (this._rightYAxisWidth !== rAxisWidth) {
                    this._rightYAxisWidth = rAxisWidth;
                    verticalLimitsAdjusted.rightLimitAdjusted = true;
                }

                if (this._leftYAxisWidth !== lAxisWidth) {
                    this._leftYAxisWidth = lAxisWidth;
                    verticalLimitsAdjusted.leftLimitAdjusted = true;
                }
            }

            return verticalLimitsAdjusted;
        },

        _adjustSubGraphVerticalLimtis: function (subGraphs, adjustment) {

            var
                subGraph, lYAxisWidth, rYAxisWidth, length;

            if (adjustment.rightLimitAdjusted || adjustment.leftLimitAdjusted) {

                lYAxisWidth = this._leftYAxisWidth;
                rYAxisWidth = this._rightYAxisWidth;

                if (adjustment.rightLimitAdjusted) {
                    this.xAxis.rightLabelsLimit(rYAxisWidth);
                    if (this.settings.onViewPortRightMarginChange) {
                        this.settings.onViewPortRightMarginChange(rYAxisWidth);
                    }
                }

                if (adjustment.leftLimitAdjusted) {
                    this.xAxis.leftLabelsLimit(lYAxisWidth);
                    if (this.settings.onViewPortLeftMarginChange) {
                        this.settings.onViewPortLeftMarginChange(lYAxisWidth);
                    }
                }

                length = subGraphs.length;

                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                    subGraph.axesWidth(rYAxisWidth, lYAxisWidth);
                }
            }
        },

        distributeGraphs: function () {
            var chartPercents = this.graphs.distributeGraphs();
            this.subGraphSizeChanged(chartPercents);
        },

        _computeSubGraphHeight: function () {
            var
                subGraphs = this.subGraphs(),
                length = subGraphs.length,
                subGraph, iRect, iRect2, bottom, sHeight,
                height, width, rAxisWidth, lAxisWidth, settings;

            if (length) {

                height = this._height - this._timeAxisHeight;
                width = this._width;
                bottom = height;
                rAxisWidth = this._rightYAxisWidth;
                lAxisWidth = this._leftYAxisWidth;

                while (--length) {

                    subGraph = subGraphs[length];

                    settings = subGraph.settings;

                    sHeight = Math.floor(height * subGraph.realEstatePercentage() / 100);

                    iRect = settings.rect;
                    iRect.left = 0;
                    iRect.right = width;
                    iRect.bottom = bottom;

                    bottom -= sHeight;

                    iRect.top = bottom;
console.log('graph dim', iRect);
                    subGraph.dimensions(iRect, rAxisWidth, lAxisWidth);
                }

                subGraph = subGraphs[0];

                iRect2 = subGraph.settings.rect;
                iRect2.left = 0;
                iRect2.top = 0;
                iRect2.right = width;
                iRect2.bottom = bottom;
                console.log('graph2 dim', iRect2);
                if(isNaN(bottom)){
                    throw new Error('rect.bottom NaN');
                }
                subGraph.dimensions(iRect2, rAxisWidth, lAxisWidth);
            }
        },

        scroll: function () {

            var
                subGraphs = this.subGraphs(),
                adjustment = this._computeSubGraphVerticalLimits(subGraphs);

            if (adjustment.leftLimitAdjusted || adjustment.rightLimitAdjusted) {
                this._adjustSubGraphVerticalLimtis(subGraphs, adjustment);
                this._computeViewPort();

            } else {
                this._associateViewPort();
            }

            this._render();
        },

        subGraphSizeChanged: function (realEstatePercentages) {
            var
                subGraphs = this.subGraphs(),
                length = subGraphs.length;
            if (length) {
                subGraphs[0].realEstatePercentage(realEstatePercentages[0]);
                while (--length) {
                    subGraphs[length].realEstatePercentage(realEstatePercentages[length]);
                }
                this._computeSubGraphHeight();
            }
        },

        limitsChanged: function (subGraphId, yScaleGroupId, yScaleGroupLimits) {
            //log('limitsChanged', yScaleGroupLimits);
            var
                subGraph = this.subGraphs(subGraphId),
                yScaleGroupRenderer = subGraph._yScaleGroupsMap[yScaleGroupId],
                subGraphs = this.subGraphs(),
                adjustment, iAxisPosition = yScaleGroupRenderer.position;

            yScaleGroupRenderer.limits(yScaleGroupLimits);

            adjustment = this._computeSubGraphVerticalLimits(subGraphs, iAxisPosition);

            if ((iAxisPosition === yAxisPosition.left && adjustment.leftLimitAdjusted) || (iAxisPosition === yAxisPosition.right && adjustment.rightLimitAdjusted)) {
                this._adjustSubGraphVerticalLimtis(subGraphs, adjustment);
                this._computeViewPort();
                this._render();
            } else {
                yScaleGroupRenderer.render();
            }
        },

        axisPositionChanged: function (subGraphId, yScaleGroupId, yScaleGroupAxisPosition) {
            this.subGraphsMap(subGraphId).yScaleGroupAxisPositionChange(yScaleGroupId, yScaleGroupAxisPosition);
            this.render();
        },

        showYAxisLabels: function (subGraphId, yScaleGroupId, yAxisLabelsVisibility) {
            this.subGraphs(subGraphId).yScaleGroupsMap[yScaleGroupId].object.showLabels(yAxisLabelsVisibility);
            this.render();
        },

        showXAxisLabels: function (showLabel) {
            var xAxis = this.xAxis;
            this._timeAxisHeight = xAxis.computeRecommendedHeight(showLabel);
            xAxis.changeLabelsVisibility(showLabel, this._timeAxisHeight);
            this._computeSubGraphHeight();
            this.render();
        },

        showCrosshair: function (subGraphId, offsetX, offsetY) {

            var subGraphs = this.subGraphs(), length = subGraphs.length, subGraph;

            for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                if (subGraph.id === subGraphId) {
                    subGraph.showCrosshair(offsetX, offsetY);
                } else {
                    subGraph.showCrosshair(offsetX);
                }
            }
        },

        hideCrosshair: function () {
            var
                subGraphs = this.subGraphs(),
                length = subGraphs.length,
                subGraph;

            for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                subGraph.hideCrosshair();
            }
        },

        triggerGesture: function (type, data) {
            // overwritten by mouse/touch modules
        },

        _render: function () {
            //log('render');

            if (this.settings.indexedData.data.length) {
                var subGraphs = this.subGraphs(),
                    length = subGraphs.length,
                    subGraph;

                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                    subGraph.render();
                }
            }

            this.xAxis.render();
        },

        render: function () {

            var
                adjustment,
                length,
                subGraph,
                subGraphs = this.subGraphs();

            console.log('render data length:', this.settings.indexedData.data.length, 'graph length:', this.subGraphs().length);
            if (this.settings.indexedData.data.length) {

                adjustment = this._computeSubGraphVerticalLimits(subGraphs);
                this._adjustSubGraphVerticalLimtis(subGraphs, adjustment);
                this._computeViewPort();
                this._render();

            } else {

                length = subGraphs.length;

                for (subGraph = subGraphs[0]; length; subGraph = subGraphs[--length]) {
                    if (subGraph.yScaleGroupLeft) {
                        subGraph.yScaleGroupLeft.render();
                    }

                    if (subGraph.yScaleGroupRight) {
                        subGraph.yScaleGroupRight.render();
                    }
                }

                this.xAxis.render();
            }
            log('chart.renderer rendered.', this.settings.indexedData.data.length);


            if(this.settings.indexedData.data.length && !this.lastDataAmountRendered){
                this.chart.emit(this.chart.loaded);
            }else if(!this.settings.indexedData.data.length && this.lastDataAmountRendered){
                this.chart.emit(this.chart.unloaded);
            }
            this.lastDataAmountRendered = this.settings.indexedData.data.length;
        },

        resize: function () {

            var
                rect = this.domNode.parentNode.getBoundingClientRect(),
                tmp;

            if(this._width === rect.width && this._height === rect.height){
                return;
            }

            this._width = rect.width;
            this._height = rect.height;

            utilities.style(this.domNode, {
                width: this._width,
                height: this._height
            });
            utilities.style(this.watermarkNode, {
                width: this._width,
                height: this._height
            });

            this._computeSubGraphHeight();

            tmp = this._timeRect;

            tmp.left = 0;
            tmp.top = 0;
            tmp.right = this._width;
            tmp.bottom = this._height;

            this.xAxis.dimensions(this._timeRect, this._leftYAxisWidth, this._rightYAxisWidth);

            tmp = this._timeRegion.rect;

            tmp.left = 0;
            tmp.top = this._height - this._timeAxisHeight;
            tmp.right = this._width;
            tmp.bottom = this._height;

            this.render();
        },

        dispose: function () {
            this.xAxis.dispose();
            this.xAxis = null;
            this._selectedTargetRenderer = null;
            //this.subGraphs(null);
            this.graphs.dispose();
            this.subGraph = null;
            //this.subGraphsMap = null;
            this._timeRect = null;
            this._timeRegion = null;
            this._viewPort = null;
            this._computeOffset = null;
            this._triggerMoveGesture = null;
            this._triggerUp = null;
            this._$domElement.off();
            this._$domElement.remove();
            this._$domeElement = null;
            this.settings = null;
        }
    });
});
