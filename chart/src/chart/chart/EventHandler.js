define([
    'dcl/dcl',
    'common/Utilities',
    'common/RegionTypes',
    'common/Rect',
    '../common/IdentifiablePoint',
    '../common/Pointer',
    '../common/EventObject',
    '../common/WheelEventObject',
    '../common/mouseEvents',
    'common/EventTarget'
], function(dcl, utilities, regionTypes, rect, IdentifiablePoint, Pointer, EventObject, WheelEventObject, mouseEvents, EventTarget){

    var
        currentEvent = {},
        pointersOne = [],
        pointersTwo = [],
        points = [],
        changedPoints = [];
        
    return dcl(null, {
        declaredClass:'EventHandler',
        constructor: function(chart){
            this.chart = chart;
            this.engine = chart.engine;
            this.renderer = this.engine.renderer;
            this.graphs = this.renderer.graphs;

            this._timeRect = rect();

            // this might change based on renderer resize
            this._timeRegion = {
                rect: rect(),
                type: regionTypes.xAxis
            };
            
            this.mouseEventsHandle = mouseEvents(this, chart.settings, chart.engine.renderer.domNode);
            this.controls = this.mouseEventsHandle.controls;
        },

        // from renderer
        _createPointer: function (id, x, y, region) {
            var
                pointer,
                iRect,
                subGraphRenderer;

            if (region) {
                subGraphRenderer = this.graphs.get(region.subGraphIndex);
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
                collection = this.graphs.get(),
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
                indexedData = this.engine.indexedData;

                viewPortIndex = Math.floor((x - this.renderer._leftYAxisWidth) / this.renderer._slotWidth);

                if (viewPortIndex < 0) {
                    viewPortIndex = 0;
                } else if (viewPortIndex >= this.renderer._viewPort.length) {
                    viewPortIndex = this.renderer._viewPort.length - 1;
                }

                pointer.barSlotCenter = this.renderer._viewPort[viewPortIndex].center;

                viewPortIndex += indexedData.beginIndex;

                pointer.timeStamp = indexedData.getTimeStampByPosition(viewPortIndex);// > indexedData.endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
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
                collection = this.graphs.get(),
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
            this._invokeCallback(this.onDownGestureCallback.bind(this), pointersOne, pointersTwo, button);
        },

        _onMove: function (iPoints, iChangedPoints, button) {
            if(!this._activeRegionsMap){
                return;
            }
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

                this._invokeCallback(this.onLeaveGestureCallback.bind(this), copiedPointers, leavePointers, button);
            }

            this._invokeCallback(this.onMoveGestureCallback.bind(this), pointersOne, pointersTwo, button);
        },

        _onUp: function (iPoints, iChangedPoints, button) {
            if(!this._activeRegionsMap){
                // this may not exist if clicked off chart
                return;
            }
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
            this._invokeCallback(this.onUpGestureCallback.bind(this), pointersOne, pointersTwo, button);
        },

        _invokeCallback: function (callback, pointers, changedPointers, button) {
            if (this.renderer._slotWidth) {
                var
                    eventObject = new EventObject(pointers, changedPointers, button);

                this._setBarSlotInfoToEventObject(eventObject);
                callback(eventObject);
            }
        },

        _setBarSlotInfoToEventObject: function (eventObject) {

            var indexedData = this.engine.indexedData,
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

                        viewPortIndex = Math.floor((pointer.x - this.renderer._leftYAxisWidth) / this.renderer._slotWidth);
                        if (viewPortIndex < 0) {
                            viewPortIndex = 0;
                        } else {
                            if (viewPortIndex >= this.renderer._viewPort.length) {
                                viewPortIndex = this.renderer._viewPort.length - 1;
                            }
                        }
                        pointer.barSlotCenter = this.renderer._viewPort[viewPortIndex].center;
                        viewPortIndex += beginIndex;
                        pointer.timeStamp = indexedData.getTimeStampByPosition(viewPortIndex);// > endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
                    }

                    processedPointers[pointer.id] = pointer;
                }

                pointers = eventObject.changedPointers;

                length = pointers.length;

                for (i = 0; i < length; i++) {
                    pointer = pointers[i];

                    if (!processedPointers[pointer.id] && pointer.region && (pointer.region.type === regionTypes.series || pointer.region.type === regionTypes.header)) {

                        viewPortIndex = Math.floor((pointer.x - this.renderer._leftYAxisWidth) / this.renderer._slotWidth);
                        if (viewPortIndex < 0) {
                            viewPortIndex = 0;
                        } else {
                            if (viewPortIndex>=this.renderer._viewPort.length) {
                                viewPortIndex = this.renderer._viewPort.length - 1;
                            }
                        }
                        pointer.barSlotCenter = this.renderer._viewPort[viewPortIndex].center;
                        viewPortIndex += beginIndex;
                        pointer.timeStamp = viewPortIndex > endIndex ? null : indexedData.data[viewPortIndex].timeStamp;
                    }
                }
            }
        },

        
        // from Engine
        //eventInspect: function (x, y) {
        //    var eventObject = this.renderer.eventInspect(x, y),
        //        result = this._createExternalEventObject(eventObject);
        //
        //    return result;
        //},

        triggerGesture: function (type, data) {
            this.renderer.triggerGesture(type, data);
        },

        _createExternalEventObject: function (eventObject) {
            //return eventObject
            var
                externalEvent = eventObject,
                tree = [],
                isTargetNull = !eventObject.target.target, length,
                search, i = 0,
                event = eventObject.target;

            eventObject.chart = this.chart;
            if (event && (event.target || event.targetParent)) {
                if (isTargetNull) {
                    event = event.targetParent;
                }
                do {
                    if(event.target.id){
                        tree.push(event.target.id);
                    }
                    else if (event.target.settings && event.target.settings.id) {
                        tree.push(event.target.settings.id);
                    }
                    else {
                        tree.push(event.target);
                    }

                    event = event.targetParent;
                    i++;
                } while (event);

                externalEvent.target = null;
                externalEvent.targetParent = undefined;

                length = tree.length - 1;
                search = this.chart.getChain(tree[length]);
                //console.log('graphs', this.renderer.subGraphs());
                //search = self.findTarget(this.renderer.subGraphs(), tree[length]);
                externalEvent.graph = search.graph;
                //externalEvent.graph = this.renderer.subGraphs(tree[length]);
                externalEvent.graphIndex = search.index || 0;
                externalEvent.target = !isTargetNull && "graph";

                length--;
                if (length >= 0) {
                    search = externalEvent.graph.groups.get(tree[length]);
                    externalEvent.axis = search;
                    externalEvent.axisIndex = search.index || 0;
                    externalEvent.target = !isTargetNull && "axis";


                    length--;
                    if (length >= 0) {
                        search = externalEvent.axis.series.get(tree[length]);
                        if(search){
                            externalEvent.serie = search;
                            externalEvent.serieIndex = search.index || 0;
                            externalEvent.target = !isTargetNull && "serie";
                        }
                        length--;
                        if (length >= 0) {
                            console.log('TREE.SECTION', tree[length]);
                            search = externalEvent.serie.sections.get(tree[length]);
                            externalEvent.layer = search;
                            externalEvent.layerIndex = search.index || 0;
                            externalEvent.target = !isTargetNull && "layer";

                            length--;
                            if (length >= 0) {
                                console.log('TREE.HOTSPOT', tree[length]);
                                externalEvent.hotspotIndex = tree[length].index;
                                externalEvent.hotspot = externalEvent.serie.inputs.get()[externalEvent.hotspotIndex];
                                externalEvent.target = !isTargetNull && "hotspot";
                            }
                        }
                    }
                }

            }
            return externalEvent;
        },

        createChain: function(hitResult){
            //console.log('------------- create chain');
            //console.log('hitResult', hitResult);
            var
                map = {
                    'Graph':'graph',
                    'Group':'axis',
                    'Serie':'serie',
                    'Section':'layer',
                    'HotSpot':'hotspot'
                },
                item,
                type,
                chain = {
                    target:map[hitResult.target.declaredClass]
                },
                parent = hitResult;
            while(parent){
                item = parent.target;
                type = map[item.declaredClass];
                chain[type] = item;
                chain[type+'Index'] = item.index || 0;
                //chain.target = type;
                console.log('   chain:', type, item.declaredClass, item);
                parent = parent.targetParent;
            }
            //console.log('CHAIN:', chain);
            return chain;
        },

        createExternalEventObject: function (eventObject) {
            var
                self = this,
                externalEvent = eventObject,
                length, i, pointer, pointers,
                cache = {},
                event = eventObject;

            event.chart = this.chart;
            if (Array.isArray(event.pointers) || Array.isArray(event.changePointers)) {
                pointers = event.pointers;
                length = pointers && pointers.length;
                for (i = 0; i < length; i++) {
                    pointer = pointers[i];
                    this._createExternalEventObject(pointer);
                    cache[pointer.id] = pointer;
                }
                pointers = event.changedPointers;
                length = pointers && pointers.length;
                for (i = 0; i < length; i++) {
                    pointer = pointers[i];
                    if (!cache[pointer.id]) {
                        this._createExternalEventObject(pointer);
                    }
                }
            } else {
                this._createExternalEventObject(eventObject);
                externalEvent = {
                    pointers: [eventObject],
                    button: eventObject.button
                };
            }

            // MEMORY LEAK?
            externalEvent.hitTest = function(x, y){
                if(x && y){
                    this.pointers[0].offsetX = x;
                    this.pointers[0].offsetY = y;
                }
                return self.hitTest(this);
            };

            //this.hitTest.bind(this);
            return externalEvent;
        },

        hitTest: function(event){

            var
                pointer = event.pointers[0],
                x = pointer.offsetX,
                y = pointer.offsetY,
                graph = pointer.graph,
                hitResult;

            if(currentEvent.x !== undefined && currentEvent.x === x && currentEvent.y === y){
                return currentEvent.chain;
            }else if(graph){
                if(graph.graph){
                    graph = graph.graph;
                }
                hitResult = graph && graph.hitTest(x, y);
                currentEvent.x = x;
                currentEvent.y = y;
                currentEvent.chain = this.createChain(hitResult);
                return currentEvent.chain;
            //}else if(typeof pointer.region.subGraphIndex === 'number'){
            //    graph = this.renderer.graphs.get(pointer.region.subGraphIndex);
            //    hitResult = graph && graph.hitTest(x, y);
            //    currentEvent.x = x;
            //    currentEvent.y = y;
            //    currentEvent.chain = this.createChain(hitResult);
            //
            //    pointer.graph = graph;
            //
            //    return currentEvent.chain;
            }
            return null;
        },



        // ported from Engine
        onDownGestureCallback: function (eventObject) {
            var externalEvent = this.createExternalEventObject(eventObject);
            return this.onEventCallback("downGesture", externalEvent);
        },
        onUpGestureCallback: function (eventObject) {
            var externalEvent = this.createExternalEventObject(eventObject);
            return this.onEventCallback("upGesture", externalEvent);
        },
        onMoveGestureCallback: function (eventObject) {
            var externalEvent = this.createExternalEventObject(eventObject);
            return this.onEventCallback("moveGesture", externalEvent);
        },
        onLeaveGestureCallback: function (eventObject) {
            var externalEvent = this.createExternalEventObject(eventObject);
            return this.onEventCallback("leaveGesture", externalEvent);
        },
        onWheelGestureCallback: function (eventObject) {
            var externalEvent = this.createExternalEventObject(eventObject);
            return this.onEventCallback("wheelGesture", externalEvent);
        },
        onEventCallback: function(type, event){
            this.chart.onEventCallback.call(this.chart, type, event);
        },

        dispose: function(){
            this.mouseEventsHandle.dispose();
        }
    });
});
