define([
    'dcl/dcl',
    '../defaults',
    'jquery',
    'common/Utilities',
    '../graph/SubGraphRenderer',
    '../axes/XAxisRenderer',
    'common/Rect',
    'chart/axes/YAxisPosition',
    'common/RegionTypes',
    'common/UserInteractionTypes',
    '../common/IdentifiablePoint',
    '../common/Pointer',
    '../common/EventObject',
    '../common/WheelEventObject',
    '../common/mouseEvents',
    'common/EventTarget',
    'localLib/logger'
], function (dcl, defaults, $, utilities, SubGraphRenderer, XAxisRenderer, rect, yAxisPosition, regionTypes, userInteractionTypes, IdentifiablePoint, Pointer, EventObject, WheelEventObject, mouseEvents, EventTarget, logger) {

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
                minZOrder = settings.minZOrder || 1,
                maxZOrder = settings.maxZOrder || 50,
                element,
                subGraphZOrderMax = maxZOrder - 1,
                xAxisZOrder = minZOrder,
                i,
                self = this;

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
                    zIndex:utilities.zindex('chart'),
                    position:'relative',
                    userSelect: 'none',
                    left: '0px',
                    top:'0px',
                    backgroundColor:settings.theme.backgroundColor//,
                    //transition:'background 500ms'
                }
            }, $parent);

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

            this.subGraphsMap = {};
            this._viewPort = [];
            this._width = 0;
            this._height = 0;
            this._slotWidth = 0;
            this._rightYAxisWidth = 0;
            this._leftYAxisWidth = 0;
            this._selectedTargetRenderer = null;

            this.subGraphs = utilities.settingArrayPropertyProxy(
                settings.subGraphs,
                this.addSubgraph.bind(this),
                this.updateSubgraph.bind(this),
                this.removeSubgraph.bind(this),
                this.clearSubgraphs.bind(this),
                this.createGraph.bind(this)
            );

            this._activeRegionsMap = {};

            this.mouseEventsHandle = mouseEvents(this, settings, this.domNode);

            //if (settings.userInteractionType) {
            //    if (settings.userInteractionType === userInteractionTypes.desktop) {
            //        this.mouseEventsHandle = mouseEvents(this, settings, this.domNode);
            //
            //    } else if (settings.userInteractionType === userInteractionTypes.mobile) {
            //        touchEvents(this, settings, this.domNode);
            //    }
            //    else {
            //        throw new Error('unsupported user interaction layer, ' + settings.userInteractionType);
            //    }
            //}

            if ($parent.height() || $parent.width()) {
                this.resize();
            }
        },

        createGraph: function (objectSetting) {
            //log('createGraph', objectSetting);
            this.minZOrder++;
            this.subGraphZOrderMax++;

            return new SubGraphRenderer(
                this._$domElement,
                $.extend(false,
                    objectSetting, {
                        //userInteractionType: settings.userInteractionType,
                        indexedData: this.settings.indexedData,
                        painterFactory: this.settings.painterFactory,
                        leftAxisWidth: this._leftYAxisWidth,
                        rightAxisWidth: this._rightYAxisWidth,
                        rect: rect(),
                        minZOrder: this.minZOrder,
                        maxZOrder: this.subGraphZOrderMax,
                        theme:this.settings.theme
                        //style: {
                        //    label: this.settings.theme.label,
                        //    line: {
                        //        color: this.settings.theme.grid.horizontalColor,
                        //        width: this.settings.theme.grid.width
                        //    },
                        //    header: {
                        //        backgroundColor: this.settings.theme.backgroundColor,
                        //        borderBottom: this.settings.theme.axis.width + 'px solid ' + this.settings.theme.axis.color + ';'
                        //    },
                        //    crosshair: this.settings.theme.crosshair
                        //}
                    }
                )
            );
        },
        
        addSubgraph: function (index, addedObject) {
            //log('addSubgraph');
            this.subGraphsMap[addedObject.id] = { object: addedObject };

            var adjustment = this._computeSubGraphVerticalLimits([]);

            if (this._width && this._height) {
                this._adjustSubGraphVerticalLimtis(this, adjustment);
                this._computeViewPort();
            } else {
                this._adjustSubGraphVerticalLimtis([], adjustment);
            }
        },

        updateSubgraph: function (updatedObject) {
            console.warn('updateSubgraph not implemented');
        },

        removeSubgraph: function (index, removedObjects) {
            var
                removeObject,
                length = removedObjects.length;

            for (removeObject = removedObjects[0]; length; removeObject = removedObjects[--length]) {
                delete this.subGraphsMap[removeObject.id];
                removeObject.dispose();
            }
        },
        
        clearSubgraphs: function (removedObjects) {
            var
                removeObject,
                length = removedObjects.length;

            if(!length){
                return;
            }

            for (removeObject = removedObjects[0]; length; removeObject = removedObjects[--length]) {
                delete this.subGraphsMap[removeObject.id];
                removeObject.dispose();
            }

            if (this.xAxis) {
                this.xAxis.render();
            }
        },
        
        _createPointer: function (id, x, y, region) {
            var
                pointer,
                iRect,
                subGraphRenderer;

            if (region) {
                subGraphRenderer = this.subGraphs(region.subGraphIndex);
                iRect = subGraphRenderer.rect();
                pointer = new Pointer(id, x, y, region, x - iRect.left, y - iRect.top);
                subGraphRenderer.processPointer(pointer);

            } else {
                region = this._timeRegion;
                iRect = region.rect;
                if (iRect.top <= y && iRect.bottom >= y && iRect.left <= x && iRect.right >= x) {
                    pointer = new Pointer(id, x, y, region, x - iRect.left, y - iRect.top);
                    pointer.target = new EventTarget(this.xAxis, null);
                } else {
                    pointer = new Pointer(id, x, y);
                    pointer.target = new EventTarget(null, null);
                }
            }
            return pointer;
        },

        eventInspect: function (x, y) {
            var
                i,
                collection = this.subGraphs(),
                length = collection.length,
                iRect,
                pointer,
                region = null,
                subGraphRenderer,
                indexedData,
                viewPortIndex;

            for (i = 0; i < length; i++) {
                subGraphRenderer = collection[i];
                iRect = subGraphRenderer.rect();
                if (iRect.top <= y && iRect.bottom >= y && iRect.left <= x && iRect.right >= x) {
                    region = subGraphRenderer.locateRegion(x - iRect.left, y - iRect.top);
                    region.subGraphIndex = i;
                    break;
                }
            }

            pointer = this._createPointer(null, x, y, region);

            if (pointer.region) {
                indexedData = this.settings.indexedData;

                viewPortIndex = Math.floor((x - this._leftYAxisWidth) / this._slotWidth);

                if (viewPortIndex < 0) {
                    viewPortIndex = 0;
                } else if (viewPortIndex >= this._viewPort.length) {
                    viewPortIndex = this._viewPort.length - 1;
                }

                pointer.barSlotCenter = this._viewPort[viewPortIndex].center;

                viewPortIndex += indexedData.beginIndex;

                pointer.timeStamp = viewPortIndex > indexedData.endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
            }

            return pointer;
        },

        _buildActiveRegionMap: function (iPoints, iChangedPoints) {
            var
                iRect,
                element, i, j, length,
                subGraphRenderer,
                map = {},
                region,
                collection = this.subGraphs(),
                sLength = collection.length;

            if (iChangedPoints) {
                length = iChangedPoints.length,
                pointersTwo.length = length;

                for (i = 0; i < length; i++) {
                    element = iChangedPoints[i];
                    region = null;

                    for (j = 0; j < sLength; j++) {
                        subGraphRenderer = collection[j];
                        iRect = subGraphRenderer.rect();
                        if (iRect.top <= element.y && iRect.bottom >= element.y && iRect.left <= element.x && iRect.right >= element.x) {
                            region = subGraphRenderer.locateRegion(element.x - iRect.left, element.y - iRect.top);
                            region.subGraphIndex = j;
                            break;
                        }
                    }
                    element = this._createPointer(element.id, element.x, element.y, region);
                    pointersTwo[i] = element;
                    map[element.id] = element;
                }
            }

            if (iPoints) {
                length = iPoints.length;
                pointersOne.length = length;

                for (i = 0; i < length; i++) {

                    element = iPoints[i];
                    region = null;

                    if (map[element.id]) {
                        pointersOne[i] = map[element.id];
                    } else {

                        for (j = 0; j < sLength; j++) {
                            subGraphRenderer = collection[j];
                            iRect = subGraphRenderer.rect();

                            if (iRect.top <= element.y && iRect.bottom >= element.y && iRect.left <= element.x && iRect.right >= element.x) {
                                region = subGraphRenderer.locateRegion(element.x - iRect.left, element.y - iRect.top);
                                region.subGraphIndex = j;
                                break;
                            }
                        }

                        element = this._createPointer(element.id, element.x, element.y, region);
                        pointersOne[i] = element;
                        map[element.id] = element;
                    }
                }
            }

            for (i in map) {
                if (map.hasOwnProperty(i)) {
                    map[i] = map[i].region;
                }
            }

            return map;
        },

        _onDown: function (iPoints, iChangedPoints, button) {
            this._activeRegionsMap = this._buildActiveRegionMap(iPoints, iChangedPoints);
            this._invokeCallback(this.settings.onDownGestureCallback, pointersOne, pointersTwo, button);
        },

        _onMove: function (iPoints, iChangedPoints, button) {

            var
                newRegions = this._buildActiveRegionMap(iPoints, iChangedPoints),
                oldRegions = this._activeRegionsMap,
                length = pointersTwo.length,
                leavePointers = [],
                pointersMap = {},
                copiedPointers = [],
                i,
                pointer, i2Pointer, oldRegion;

            for (i = 0; i < length; i++) {

                pointer = pointersTwo[i];
                oldRegion = oldRegions[pointer.id];

                if ((!pointer.region && oldRegion) || (oldRegion && (pointer.region.type !== oldRegion.type || pointer.region.subGraphIndex !== oldRegion.subGraphIndex))) {

                    i2Pointer = new Pointer(pointer.id, pointer.x, pointer.y, pointer.region, pointer.offsetX, pointer.offsetY);

                    i2Pointer.prices = pointer.prices;
                    i2Pointer.target = pointer.target;

                    pointersMap[pointer.id] = i2Pointer;
                    leavePointers.push(i2Pointer);
                }
            }

            this._activeRegionsMap = newRegions;

            if (leavePointers.length) {
                length = pointersOne.length;

                for (i = 0; i < length; i++) {
                    pointer = pointersOne[i];

                    if (pointersMap[pointer.id]) {
                        copiedPointers[i] = pointersMap[pointer.id];
                    } else {

                        i2Pointer = new Pointer(pointer.id, pointer.x, pointer.y, pointer.region, pointer.offsetX, pointer.offsetY);
                        i2Pointer.prices = pointer.prices;
                        i2Pointer.target = pointer.target;
                        copiedPointers[i] = i2Pointer;
                    }
                }

                this._invokeCallback(this.settings.onLeaveGestureCallback, copiedPointers, leavePointers, button);
            }

            this._invokeCallback(this.settings.onMoveGestureCallback, pointersOne, pointersTwo, button);
        },

        _onUp: function (iPoints, iChangedPoints, button) {
            var
                i,
                length = iChangedPoints.length,
                point,
                region;

            pointersTwo.length = length;

            for (i = 0; i < length; i++) {
                point = iChangedPoints[i];
                region = this._activeRegionsMap[point.id];
                point = this._createPointer(
                    point.id,
                    point.x,
                    point.y,
                    region && region.type !== regionTypes.xAxis ? region : null
                );

                pointersTwo[i] = point;
            }

            this._activeRegionsMap = this._buildActiveRegionMap(iPoints);
            this._invokeCallback(this.settings.onUpGestureCallback, pointersOne, pointersTwo, button);
        },

        _invokeCallback: function (callback, pointers, changedPointers, button) {
            if (this._slotWidth) {
                var
                    eventObject = new EventObject(pointers, changedPointers, button);

                this._setBarSlotInfoToEventObject(eventObject);
                callback(eventObject);
            }
        },

        _setBarSlotInfoToEventObject: function (eventObject) {

            var indexedData = this.settings.indexedData,
                beginIndex = indexedData.beginIndex,
                endIndex = indexedData.endIndex,
                processedPointers = {},
                i, length, viewPortIndex, pointer, pointers;

            if (indexedData.data.length) {
                pointers = eventObject.pointers;
                length = pointers.length;

                for (i = 0; i < length; i++) {
                    pointer = pointers[i];

                    if (pointer.region && (pointer.region.type === regionTypes.series || pointer.region.type === regionTypes.header)) {

                        viewPortIndex = Math.floor((pointer.x - this._leftYAxisWidth) / this._slotWidth);
                        if (viewPortIndex < 0) {
                            viewPortIndex = 0;
                        } else {
                            if (viewPortIndex >= this._viewPort.length) {
                                viewPortIndex = this._viewPort.length - 1;
                            }
                        }
                        pointer.barSlotCenter = this._viewPort[viewPortIndex].center;
                        viewPortIndex += beginIndex;
                        pointer.timeStamp = viewPortIndex > endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
                    }

                    processedPointers[pointer.id] = pointer;
                }

                pointers = eventObject.changedPointers;

                length = pointers.length;

                for (i = 0; i < length; i++) {
                    pointer = pointers[i];

                    if (!processedPointers[pointer.id] && pointer.region && (pointer.region.type === regionTypes.series || pointer.region.type === regionTypes.header)) {

                        viewPortIndex = Math.floor((pointer.x - this._leftYAxisWidth) / this._slotWidth);
                        if (viewPortIndex < 0) {
                            viewPortIndex = 0;
                        } else {
                            if (viewPortIndex>=this._viewPort.length) {
                                viewPortIndex = this._viewPort.length - 1;
                            }
                        }
                        pointer.barSlotCenter = this._viewPort[viewPortIndex].center;
                        viewPortIndex += beginIndex;
                        pointer.timeStamp = viewPortIndex > endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
                    }
                }
            }
        },

        dispose: function () {
            this.mouseEventsHandle.dispose();
            this.xAxis.dispose();
            this.xAxis = null;
            this._selectedTargetRenderer = null;
            this.subGraphs(null);
            this.subGraph = null;
            this.subGraphsMap = null;
            this._timeRect = null;
            this._timeRegion = null;
            this._activeRegionsMap = null;
            this._viewPort = null;
            this._computeOffset = null;
            this._triggerMoveGesture = null;
            this._triggerUp = null;
            this._$domElement.off();
            this._$domElement.remove();
            this._$domeElement = null;
            this.settings = null;
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
            //log('_associateViewPort');
            var
                i = 0,
                indexedData = this.settings.indexedData,
                viewPort = this._viewPort,
                beginIndex = indexedData.beginIndex,
                endIndex = indexedData.endIndex;

            indexedData = indexedData.data;
            //console.log('_associateViewPort', beginIndex, endIndex, indexedData);
            if (beginIndex) {
                indexedData[beginIndex - 1].viewPortSlot = null;
            }

            if (endIndex <= indexedData.length - 2) {
                indexedData[endIndex + 1].viewPortSlot = null;
            }

            while (beginIndex <= endIndex) {
                indexedData[beginIndex].viewPortSlot = viewPort[i];
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

        _computeSubGraphHeight: function () {
            var
                subGraphs = this.subGraphs(),
                length = subGraphs.length,
                subGraph, iRect, bottom, sHeight,
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

                    sHeight = Math.floor(height * settings.realEstatePercentage / 100);

                    iRect = settings.rect;

                    iRect.left = 0;
                    iRect.right = width;
                    iRect.bottom = bottom;

                    bottom -= sHeight;

                    iRect.top = bottom;

                    subGraph.dimensions(iRect, rAxisWidth, lAxisWidth);
                }

                subGraph = subGraphs[0];

                settings = subGraph.settings;

                iRect = settings.rect;
                iRect.left = 0;
                iRect.top = 0;
                iRect.right = width;
                iRect.bottom = bottom;

                subGraph.dimensions(iRect, rAxisWidth, lAxisWidth);
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
                subGraph = this.subGraphsMap[subGraphId],
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
            this.subGraphsMap[subGraphId].object.yScaleGroupAxisPositionChange(yScaleGroupId, yScaleGroupAxisPosition);
            this.render();
        },

        showYAxisLabels: function (subGraphId, yScaleGroupId, yAxisLabelsVisibility) {
            this.subGraphsMap[subGraphId].object.yScaleGroupsMap[yScaleGroupId].object.showLabels(yAxisLabelsVisibility);
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

        render: function () {
            
            var
                adjustment,
                length,
                subGraph,
                subGraphs = this.subGraphs();
                
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
                this.chart.emit('loaded');
            }else if(!this.settings.indexedData.data.length && this.lastDataAmountRendered){
                this.chart.emit('unloaded');
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
        }
    });
});
