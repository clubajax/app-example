define([
    'dcl/dcl',
    'jquery',
    '../defaults',
    'common/Utilities',
    './Renderer',
    '../scalers/ScalerTypes',
    '../scalers/LogarithmicScaler',
    '../scalers/LinearScaler',
    'localLib/logger'
], function (dcl, $, defaults, utilities, Renderer, scalerTypes, LogarithmicScaler, LinearScaler, logger) {

    var
        loggingEnabled = 0,
        log = logger('E', loggingEnabled, 'Chart Engine');

    function notSupported() {
        throw new Error('operation is not supported');
    }

    return dcl(null, {
        declaredClass:'Engine',
        constructor: function($parent, chartSettings, chartSettingObject){
            log('Chart Engine loaded');
            if(loggingEnabled){
                window.engine = this;
            }

            // indexedData needs to be set before getting settings
            this.indexedData = {
                data: [],
                beginIndex: -2,
                endIndex: -1
            };

            var
                settings = this.getChartSettings(chartSettings, chartSettingObject),
                subgs = settings.subGraphs,
                subgsLength = subgs.length,
                i, subg;

            this._$parent = $parent;
            this.rendererSettings = chartSettings;
            this.chart = chartSettingObject;
            this.id = utilities.uid('engine');

            
            this.minViewPortSize = chartSettings.xAxis.minimumNumberOfVisibleBars;
            this.onLimitsChanged = chartSettings.xAxis.onLimitsChanged;
            this.onTotalRangeMaxChanged = chartSettings.xAxis.onTotalRangeMaxChanged;

            this.renderer = new Renderer($parent, settings, this.chart);


            for (i = 0; i < subgsLength; i++) {
                subg = subgs[i];
                this.initGraph(subg);
            }

            this.renderer.viewPortSize = chartSettings.xAxis.maximumNumberOfVisibleBars;

            this._setIndexes(-20, -10);
            this._lastRange = null;
            this.setLimits(chartSettings.xAxis.limits);

            if (settings.totalRealEstate !== 1) {
                this.distributeGraphs(settings.subGraphs);
            }
        },

        getChartSettings: function (settings, chart) {
            var
                i,
                graphs = utilities.getValue(settings.graphs),
                length = graphs && graphs.length,
                yGraphsSettings,
                totalPercentage = 0,
                userInteractionType = chart.userInteractionType.bind(chart),
                initialSettings = {
                    id: utilities.idGenerator('engine'),
                    painterFactory: utilities.getValue(chart.painterFactory),
                    resourceManager: chart.resourceManager,
                    indexedData: this.indexedData,
                    onViewPortLeftMarginChange: chart.onViewPortLeftMarginChange.bind(chart),
                    onViewPortRightMarginChange: chart.onViewPortRightMarginChange.bind(chart),
                    subGraphs: [],
                    timeAxis: this.getTimeSettings(utilities.getValue(settings.xAxis)),
                    theme: settings.theme
                },
                interactionBroker = this.getChartInteractiveBroker(chart, userInteractionType, chart.onEventCallback.bind(chart));

            if (interactionBroker) {
                $.extend(initialSettings, interactionBroker);
            }

            if (chart._settings) {
                chart._settings.id = initialSettings.id;
            }
            chart.id = initialSettings.id;

            for (i = 0; i < length; i++) {
                yGraphsSettings = this.getGraphSettings(graphs[i]);
                totalPercentage += utilities.getValue(yGraphsSettings.realEstatePercentage) || 0;
                initialSettings.subGraphs.push(yGraphsSettings);
            }
            initialSettings.totalRealEstate = totalPercentage;
            return initialSettings;
        },

        getGraphSettings: function (graph) {
            var
                i,
                axes = utilities.getValue(graph.axes),
                length = axes && axes.length,
                header = utilities.getValue(graph.header),
                yScaleGroupSettings,
                initialSettings = {
                    id: utilities.getValue(graph.id) || utilities.idGenerator('graph'),
                    headerDomElement: utilities.getValue(header && header.domElement),
                    headerHeight: utilities.getValue(header && header.height),
                    onHeaderRectChanged: utilities.getValue(header && header.onRectChanged),
                    realEstatePercentage: utilities.getValue(graph.realEstatePercentage) || 1,
                    yScaleGroups: []
                };
                
            graph.id = initialSettings.id;
            if (graph._settings) {
                graph._settings.id = initialSettings.id;
            }

            for (i = 0; i < length; i++) {
                yScaleGroupSettings = this.getScaleSettings(axes[i]);
                initialSettings.yScaleGroups.push(yScaleGroupSettings);
            }
            return initialSettings;
        },

        initGraph: function (subg) {
            var
                ySGs = subg.yScaleGroups,
                ySGsLength = ySGs.length,
                j, ysg;
            for (j = 0; j < ySGsLength; j++) {
                ysg = ySGs[j];
                this.initAxis(subg, ysg);
            }
        },

        initAxis: function (subg, ysg) {
            log('initAxis');
            var
                yScG = this.getYScaleGroupById(subg.id, ysg.id),
                sers = ysg.series,
                sersLength = sers.length,
                k, ser;

            yScG.settings.isAutoScale = !!((ysg.settings && ysg.settings.isAutoScale) || ysg.isAutoScale);

            log('isAutoScale', yScG.settings.isAutoScale);

            for (k = 0; k < sersLength; k++) {
                ser = sers[k];
                this.addDataRange(subg.id, ysg.id, ser.id, utilities.getValue(ser.data));
            }
        },

        findTarget: function (collection, id) {
            var
                j, result,
                jElements = utilities.getValue(collection),
                jLength = jElements && jElements.length;

            for (j = 0; j < jLength; j++) {
                if (jElements[j]._settings.id === id) {
                    result = jElements[j];
                    break;
                }
            }
            return {
                object: result,
                index: j
            };
        },

        findIndexById: function (list, objectId) {
            var length = list.length, i, result = -1, settings;
            for (i = 0; i < length; i++) {
                settings = list[i].settings;
                if (settings.id === objectId) { //||settings._id === objectId
                    result = i;
                    break;
                }
            }
            return result;
        },

        findGraphIndex: function (graphId) {
            return this.findIndexById(this.renderer.subGraphs(), graphId);
        },

        findSubgraphIndex: function (graph, subgraphId) {
            return this.findIndexById(graph.yScaleGroups(), subgraphId);
        },

        findSerieIndex: function (yScaleGroup, serieId) {
            return this.findIndexById(yScaleGroup.series(), serieId);
        },

        findLayerIndex: function (serie, layerId) {
            return this.findIndexById(serie.layers(), layerId);
        },

        getPositionByTimeStamp: function (timeStamp) {
            var
                data = this.indexedData.data;
            return utilities.searchClosestTimeStamp(data, { timeStamp: timeStamp });
        },

        getTimeStampByPosition: function (index) {
            var
                data = this.indexedData.data;
            return index < 0 || index >= data.length ? null : data[index].timeStamp;
        },

        eventInspect: function (chartSettingObject, x, y) {
            var eventObject = this.renderer.eventInspect(x, y),
                result = this._createExternalEventObject(chartSettingObject, eventObject);
            result.chart = chartSettingObject;
            return result;
        },

        triggerGesture: function (type, data) {
            this.renderer.triggerGesture(type, data);
        },

        _createExternalEventObject: function (chartSettingObject, eventObject) {
            var
                externalEvent = eventObject,
                self = this,
                tree = [],
                isTargetNull = !eventObject.target.target, length,
                search, i = 0,
                event = eventObject.target;
            
            if (event.target !== null || event.targetParent !== null) {
                if (isTargetNull) {
                    event = event.targetParent;
                }
                do {
                    if (event.target.settings) {
                        if (event.target.settings.id) {
                            tree.push(event.target.settings.id);
                        }
                    } else {
                        tree.push(event.target);
                    }
                    event = event.targetParent;
                    i++;
                } while (event);

                externalEvent.target = null;
                externalEvent.targetParent = undefined;

                length = tree.length - 1;
                search = self.findTarget(chartSettingObject.graphs(), tree[length]);
                externalEvent.graph = search.object;
                externalEvent.graphIndex = search.index;
                externalEvent.target = !isTargetNull && "graph";

                length--;
                if (length >= 0) {
                    //#region axis
                    search = self.findTarget(externalEvent.graph.axes(), tree[length]);
                    externalEvent.axis = search.object;
                    externalEvent.axisIndex = search.index;
                    externalEvent.target = !isTargetNull && "axis";
                    //#endregion

                    length--;
                    if (length >= 0) {
                        //#region Serie
                        search = self.findTarget(externalEvent.axis.series(), tree[length]);
                        externalEvent.serie = search.object;
                        externalEvent.serieIndex = search.index;
                        externalEvent.target = !isTargetNull && "serie";
                        //#endregion

                        length--;
                        if (length >= 0) {
                            //#region Layer
                            search = self.findTarget(externalEvent.serie.layers(), tree[length]);
                            externalEvent.layer = search.object;
                            externalEvent.layerIndex = search.index;
                            externalEvent.target = !isTargetNull && "layer";
                            //#endregion

                            length--;
                            if (length >= 0) {
                                //#region HotSpot
                                externalEvent.hotspotIndex = tree[length].index;
                                externalEvent.hotspot = externalEvent.serie.inputs()[externalEvent.hotspotIndex];
                                //externalEvent.hotspot = self.findTarget(externalEvent.serie.inputs(), tree[length]).object;
                                externalEvent.target = !isTargetNull && "hotspot";
                                //#endregion
                            }
                        }
                    }
                }

            }
            return externalEvent;
        },

        createExternalEventObject: function (chartSettingObject, eventObject) {
            var
                externalEvent = eventObject,
                length, i, pointer, pointers,
                cache = {},
                event = eventObject;

            event.chart = chartSettingObject;
            if (utilities.isArray(event.pointers) || utilities.isArray(event.changePointers)) {
                pointers = event.pointers;
                length = pointers && pointers.length;
                for (i = 0; i < length; i++) {
                    pointer = pointers[i];
                    this._createExternalEventObject(chartSettingObject, pointer);
                    cache[pointer.id] = pointer;
                }
                pointers = event.changedPointers;
                length = pointers && pointers.length;
                for (i = 0; i < length; i++) {
                    pointer = pointers[i];
                    if (!cache[pointer.id]) {
                        this._createExternalEventObject(chartSettingObject, pointer);
                    }
                }
            } else {
                this._createExternalEventObject(chartSettingObject, eventObject);
                externalEvent = {
                    pointers: [eventObject],
                    button: eventObject.button
                };
            }
            return externalEvent;
        },

        getChartInteractiveBroker: function (chartSettingObject, userInteractionType, onEventCallback) {
            // hairball.
            var
                chartInteractiveBroker,
                self = this;
            if (userInteractionType && utilities.getValue(userInteractionType) && onEventCallback) {
                chartInteractiveBroker = {
                    userInteractionType: utilities.getValue(userInteractionType),
                    onDownGestureCallback: function (eventObject) {
                        var externalEvent = self.createExternalEventObject(chartSettingObject, eventObject);
                        return onEventCallback("downGesture", externalEvent);
                    },
                    onUpGestureCallback: function (eventObject) {
                        var externalEvent = self.createExternalEventObject(chartSettingObject, eventObject);
                        return onEventCallback("upGesture", externalEvent);
                    },
                    onMoveGestureCallback: function (eventObject) {
                        var externalEvent = self.createExternalEventObject(chartSettingObject, eventObject);
                        return onEventCallback("moveGesture", externalEvent);
                    },
                    onLeaveGestureCallback: function (eventObject) {
                        var externalEvent = self.createExternalEventObject(chartSettingObject, eventObject);
                        return onEventCallback("leaveGesture", externalEvent);
                    },
                    onWheelGestureCallback: function (eventObject) {
                        var externalEvent = self.createExternalEventObject(chartSettingObject, eventObject);
                        return onEventCallback("wheelGesture", externalEvent);
                    }
                };
            }
            return chartInteractiveBroker;
        },

        onChartAxesStyleChanged: function (newValue) {
            this.renderer.label(newValue);
        },

        onChartBackgroundColorChanged: function (newValue) {
            this.renderer.backgroundColor(newValue);
        },

        onChartLabelStyleChanged: function (newValue) {
            this.renderer.label(newValue);
        },

        onChartGridStyleChanged: function (newValue) {
            this.renderer.grid(newValue);
        },

        resize: function () {
            this.renderer.resize();
        },

        setOnViewPortLeftMarginChange: function (callback) {
            this.renderer.onViewPortLeftMarginChange = callback;
        },

        setOnViewPortRightMarginChange: function (callback) {
            this.renderer.onViewPortRightMarginChange = callback;
        },
        //#region engine internals
        //#region lookups

        getSubGraphById: function (graphId) {
            return this.renderer.subGraphsMap[graphId].object;
        },

        getYScaleGroupById: function (graphId, yScaleGroupId) {
            var
                graph = this.renderer.subGraphsMap[graphId].object;
            return graph.yScaleGroupsMap[yScaleGroupId].object;
        },

        getSerieById: function (graphId, yScaleGroupId, serieId) {
            var
                yScaleGroup, result,
                graph = this.renderer.subGraphsMap[graphId].object;

            yScaleGroup = graph.yScaleGroupsMap[yScaleGroupId].object;
            try {
                result = yScaleGroup.seriesMap[serieId].object;
            } catch (e) {
                //debugger;
                throw e;
            }

            return result;
        },

        getSectionById: function (graphId, yScaleGroupId, serieId, layerId) {
            var
                yScaleGroup, serie,
                graph = this.renderer.subGraphsMap[graphId].object;

            yScaleGroup = graph.yScaleGroupsMap[yScaleGroupId].object;
            serie = yScaleGroup.seriesMap[serieId].object;
            return serie.sectionsMap[layerId].object;
        },

        /**
        * retrieves all the yScaleGroups.  
        *
        * @method getAllYScaleGroups
        * @return {Array} all the yScaleGroups 
        */
        getAllYScaleGroups: function () {
            var
                subgraphs = this.renderer.subGraphs(), i,
                subgraphLength = subgraphs.length,
                yScaleGroups,
                result = [];
            for (i = 0; i < subgraphLength; i++) {
                yScaleGroups = subgraphs[i].yScaleGroups();
                result = result.concat(yScaleGroups);
            }
            return result;
        },

        /**
        * retrieves all the yScaleGroups with Limits in auto.  
        *
        * @method getAutoYScaleGroups
        * @return {Array} all the yScaleGroups 
        */
        getAutoLimitYScaleGroups: function () {
            var
                graphs, graphLength, i, result = [],
                yScaleGroups, yScaleGroupLength, j,
                graph;

            graphs = this.renderer.subGraphs();
            graphLength = graphs.length;
            for (i = 0; i < graphLength; i++) {
                graph = graphs[i];
                yScaleGroups = graph.yScaleGroups();
                yScaleGroupLength = yScaleGroups.length;
                for (j = 0; j < yScaleGroupLength; j++) {
                    if (yScaleGroups[i].settings.isAutoScale) {
                        result.push(yScaleGroups[i]);
                    }
                }
            }
            return result;
        },


        /**
        * makes the view port go to real time.
        *
        * @method getRealTimeRange
        * @return {Object} realtime range
        */
        getRealTimeRange: function () {
            var
                numberOfBars = this._chartSettings.xAxis._settings.maximumNumberOfVisibleBars,
                indexedData = this.indexedData,
                data = indexedData.data,
                datalength = data.length,
                newRange, delta;

            if (!this.isBirdView) {
                delta = numberOfBars;
            } else {
                delta = datalength;
            }

            if (datalength < numberOfBars) {
                delta = datalength;
            }

            newRange = {
                minValueIndex: datalength - delta,
                maxValueIndex: datalength - 1
            };

            return newRange;
        },


        batchUpdateChart: function (newRange) {
            // updates the chart to a new range.
            //
            // @method batchUpdateChart
            // @newRange {Object} the new range
            // @return nothing
            this.isBirdView = this.indexedData.endIndex - this.indexedData.beginIndex >= this.indexedData.data.length - 2;
            this.setLimitsInRange(newRange);
        },

        //#region Limits Calculations
        temporaryValueLimits: null,
        //calculate the limits for a serie
        getSerieValueLimits: function (serie, paintablePoints, dataPoint, previousLimits) {
            var
                definesScaling = serie.definesScaling,
                minValue, maxValue, dataValues = dataPoint.values, value,
                length = paintablePoints.length;

            if (definesScaling === undefined || definesScaling) {


                if (!previousLimits) {
                    minValue = Number.MAX_VALUE;
                    maxValue = Number.MIN_VALUE;
                    previousLimits = {
                        minValue: minValue,
                        maxValue: maxValue
                    };
                }

                maxValue = minValue = dataValues[paintablePoints[0]].value;

                length--;

                for (value = dataValues[paintablePoints[length]].value; length; value = dataValues[paintablePoints[--length]].value) {
                    if (value > maxValue) {
                        maxValue = value;
                    }

                    if (value < minValue) {
                        minValue = value;
                    }
                }

                previousLimits.minValue = minValue;
                previousLimits.maxValue = maxValue;

                return previousLimits;
            } else {
                return null;
            }
        },
        
        //get (and set in cache) the paintable points of a serie
        getSeriePaintablePoints: function (serie) {
            var sections,
                sectionLength, i,
                datapointDefinition, dataPointDefinitions,
                dataPointLength, j,
                result = serie._paintablePoints,
                key, resultMap;

            if (!result) {
                result = [];
                resultMap = {};
                sections = serie.sections();
                sectionLength = sections.length;
                for (i = 0; i < sectionLength; i++) {
                    dataPointDefinitions = sections[i].dataPointDefinitions();
                    dataPointLength = dataPointDefinitions.length;
                    for (j = 0; j < dataPointLength; j++) {
                        datapointDefinition = dataPointDefinitions[j];
                        //if the datapoint definition is a value type (as opposed to text, bool, etc)
                        //TODO: REMEMBER THE COMMENT ABOVE!!!
                        if (datapointDefinition.isValue || datapointDefinition.isValue === undefined) {
                            key = datapointDefinition.key;
                            if (!resultMap[key]) {
                                resultMap[key] = datapointDefinition;
                                result.push(key);
                            }
                        }
                    }
                }
                serie._paintablePoints = result;
            }
            return result;
        },

        calculateNewSerieValueLimits: function (serie, paintablePoints, datapoint, index, currentLimits) {
            var
                limits =
                this.temporaryValueLimits = this.getSerieValueLimits(serie, paintablePoints, datapoint, this.temporaryValueLimits);

            if (limits.minValue < currentLimits.minValue) {
                currentLimits.minValueIndex = index;
                currentLimits.minValue = limits.minValue;
            }

            if (limits.maxValue > currentLimits.maxValue) {
                currentLimits.maxValueIndex = index;
                currentLimits.maxValue = limits.maxValue;
            }
        },

        processSerieValueLimits: function (serie, beginIdx, endIdx, valueLimits) {
            var
                idx,
                paintablePoints = this.getSeriePaintablePoints(serie),
                datapoint,
                data = serie.settings.serie.data,
                dataLength = data ? data.length : 0,
                result = false;
                
            if (paintablePoints && paintablePoints.length) {
                this.calculateNewSerieValueLimits(serie, paintablePoints, data[beginIdx], beginIdx, valueLimits);
                for (idx = beginIdx + 1; idx <= endIdx && idx < dataLength; idx++) {
                    datapoint = data[idx];
                    this.calculateNewSerieValueLimits(serie, paintablePoints, datapoint, idx, valueLimits);
                }
                result = true;
            }
            return result;
        },

        findTimeIndexinData: function (data, timeStamp) {
            //TODO: optimize
            return utilities.binarySearch(data, { timeStamp: timeStamp }, this.timeStampedObjectComparator);
        },

        findFloorIndex: function (data, timeStamp) {
            var
                search = utilities.binarySearch(data, timeStamp, utilities.mixTimeStampComparator);
            if (!search.found) {
                if (search.index > 0) {
                    search.index--;
                }
            }
            return search.index;
        },

        findFloor: function (data, timeStamp) {
            var search = utilities.binarySearch(data, timeStamp, utilities.mixTimeStampComparator);
            if (!search.found) {
                if (search.index > 0) {
                    search.index--;
                }
            }
            return search;
        },

        findCeil: function (data, timeStamp) {
            var search = utilities.binarySearch(data, timeStamp, utilities.mixTimeStampComparator);
            return search;
        },

        findCeilIndex: function (data, timeStamp) {
            var search = utilities.binarySearch(data, timeStamp, utilities.mixTimeStampComparator);
            return search.index;
        },

        findTimeLimitsInSerieRange: function (serie, beginTimeStamp, endTimeStamp, combine) {
            var
                data = serie.settings.serie.data,
                currentLimits = serie.settings.serie.limits,
                timelimits, begin, beginIdx, end, endIdx;

            if (data.length) {
                if (combine && currentLimits && currentLimits.time) {
                    beginTimeStamp = beginTimeStamp < currentLimits.time.minValue ? beginTimeStamp : currentLimits.time.minValue;
                    endTimeStamp = endTimeStamp > currentLimits.time.maxValue ? endTimeStamp : currentLimits.time.maxValue;
                }
                begin = this.findCeilIndex(data, beginTimeStamp);
                beginIdx = begin;
                end = this.findFloorIndex(data, endTimeStamp);
                endIdx = end;

                if (beginIdx <= data.length - 1 && endIdx >= 0 && endIdx >= beginIdx) {
                    if (beginIdx < 0) {
                        beginIdx = 0;
                    }
                    if (endIdx >= data.length) {
                        endIdx = data.length - 1;
                    }
                    currentLimits = currentLimits || { time: {} };
                    currentLimits.time = currentLimits.time || {};
                    timelimits = currentLimits.time;
                    timelimits.minValueIndex = beginIdx;
                    timelimits.minValue = data[beginIdx].timeStamp;
                    timelimits.maxValue = data[endIdx].timeStamp;
                    timelimits.maxValueIndex = endIdx;
                    serie.settings.serie.limits = currentLimits;

                    //console.log('limits after adding: ' + JSON.stringify(currentLimits, null, 2));
                } else {
                    serie.settings.serie.limits = null;
                }
            } else {
                serie.settings.serie.limits = null;
            }
        },

        setSerieLimitsInRange: function (serie, beginTimeStamp, endTimeStamp) {
            this.findTimeLimitsInRange(serie, beginTimeStamp, endTimeStamp);
            var limits = utilities.findLimitsInSerieRange(serie, beginTimeStamp, endTimeStamp);
            serie.dirtyValueLimits = true;
            serie.limits = limits;
        },

        copyLimits: function (source, target) {
            if (!target) {
                target = {};
            }
            target.minValue = source.minValue;
            target.minValueIndex = source.minValueIndex;
            target.maxValue = source.maxValue;
            target.maxValueIndex = source.maxValueIndex;
            return target;
        },

        calculateChartLimits: function () {
            var
                subGraphs = this.renderer.subGraphs(),
                length = subGraphs.length, i;

            for (i = 0; i < length; i++) {
                this.calculateGraphLimits(subGraphs[i]);
            }
        },

        calculateGraphLimitsById: function (graphId) {
            if (this.indexedData.data.length) {
                this.calculateGraphLimits(this.getSubGraphById(graphId));
            }
        },

        calculateGraphLimits: function (graph) {
            var
                yScaleGroups = graph.yScaleGroups(),
                length = yScaleGroups.length, i;

            for (i = 0; i < length; i++) {
                this.calculateYScaleLimits(yScaleGroups[i]);
            }
        },

        calculateYScaleLimitsById: function (graphId, yScaleGroupId) {
            var yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            this.calculateYScaleLimits(yScaleGroup);
        },

        calculateYScaleLimits: function (yScaleGroup) {
            if (this.indexedData.data.length) {
                var indexedData = this.indexedData,
                    beginIdx = indexedData.beginIndex,
                    endIdx = indexedData.endIndex,
                    beginTimeStamp = indexedData.data[beginIdx].timeStamp,
                    endTimeStamp = indexedData.data[endIdx].timeStamp;
                this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
            } else {
                yScaleGroup.limits(null);
            }
        },

        setYScaleLimitsInRange: function (yScaleGroup, beginTimeStamp, endTimeStamp, combine) {

            var series, serieLength, i, serie, limits, serieLimits,
                beginIdx, endIdx, hasLimits = false;

            series = yScaleGroup.series();
            serieLength = series.length;
            for (i = 0; i < serieLength; i++) {
                serie = series[i];
                this.findTimeLimitsInSerieRange(serie, beginTimeStamp, endTimeStamp, combine);
            }
            if (yScaleGroup.settings.isAutoScale) {
                if (serieLength) {
                    limits = {
                        minValueIndex: Number.MAX_VALUE,
                        minValue: Number.MAX_VALUE,
                        maxValueIndex: Number.MIN_VALUE,
                        maxValue: Number.MIN_VALUE
                    };
                }

                for (i = 0; i < serieLength; i++) {
                    serie = series[i];
                    serieLimits = serie.settings.serie.limits && serie.settings.serie.limits.time;
                    if (serieLimits) {
                        beginIdx = serieLimits.minValueIndex;
                        endIdx = serieLimits.maxValueIndex;
                        hasLimits = this.processSerieValueLimits(serie, beginIdx, endIdx, limits) || hasLimits;
                    }
                }
                if (hasLimits) {
                    yScaleGroup.limits(limits);
                } else {
                    yScaleGroup.limits(null);
                }

            }
        },



        onRangeChanged: function (newRange, changeVisibleBars) {
            // reacts to a new range.
            // @method onRangeChanged
            // @newRange {Object} the new range
            // @return nothing

            var
                lastRange = this._lastRange,
                actualRange,
                minimumNumberofVisibleBars = this.minViewPortSize,
                indexedData = this.indexedData,
                newViewPortSize,
                min = newRange.minValueIndex,
                max = newRange.maxValueIndex;

            log('onRangeChanged');

            changeVisibleBars = changeVisibleBars === undefined || changeVisibleBars;
            try {
                //if no change compared to the last one then do nothing
                if (lastRange && lastRange.minValueIndex === min && lastRange.maxValueIndex === max) {
                    return;
                }

                this._lastRange = newRange;

                //if no change compared to the indexdata range then do nothing
                if (min === indexedData.beginIndex && max === indexedData.endIndex) {
                    return;
                }

                //if limits are less than the minimum number of bars
                if ((max - min + 1) < minimumNumberofVisibleBars) {
                    //if thre is enough bars to set the minimum
                    if (max - 1 > minimumNumberofVisibleBars) {
                        min = max - minimumNumberofVisibleBars + 1;
                    } else {
                        min = 0;
                        max = minimumNumberofVisibleBars - 1;
                    }
                }

                if (changeVisibleBars) {
                    newViewPortSize = max - min + 1;
                    if (this.renderer.viewPortSize !== newViewPortSize) {

                        this.renderer.viewPortSize = newViewPortSize;
                    }
                }

                actualRange = {
                    minValueIndex: min >= 0 ? min : 0,
                    maxValueIndex: max < indexedData.data.length - 1 ? max : indexedData.data.length - 1
                };

                this.batchUpdateChart(actualRange);

            } catch (e) {
                console.error(e.stack);
                utilities.throwError(e);
            }
        },

        /**
        * calculates limit calculation actions on range change.
        *
        * @method getLimitCalculationRanges
        * @currentRange {Object} the current range
        * @newRange {Object} the new range
        * @return {false || true || Object}
        *    false if newRange === currentRange
        *    true if requires new Limits calculation
        *    {added : [{minValueIndex, maxValueIndex}], removed : [{minValueIndex, maxValueIndex}]} ranges added or removed
        */
        getLimitCalculationData: function (currentRange, newRange) {
            var
                result = false,
                newMin = newRange.minValueIndex,
                newMax = newRange.maxValueIndex,
                currentMin = currentRange.minValueIndex,
                currentMax = currentRange.maxValueIndex, isAdding;

            if (newMin !== currentMin || newMax !== currentMax) {
                //if we are outside of range
                if (newMax < currentMin || newMin > currentMax) {
                    result = true;
                } else {
                    result = {
                        added: [],
                        removed: []
                    };
                    if (newMin !== currentMin) {
                        isAdding = newMin < currentMin;
                        if (isAdding) {
                            result.added.push({
                                minValueIndex: newMin,
                                maxValueIndex: currentMin - 1
                            });
                        } else {
                            result.removed.push({
                                minValueIndex: currentMin,
                                maxValueIndex: newMin
                            });
                        }
                    }

                    if (newMax !== currentMax) {
                        isAdding = newMax > currentMax;
                        if (isAdding) {
                            result.added.push({
                                minValueIndex: currentMax + 1,
                                maxValueIndex: newMax
                            });
                        } else {
                            result.removed.push({
                                minValueIndex: newMax,
                                maxValueIndex: currentMax
                            });
                        }
                    }
                }
            }
            return result;
        },

        removeSerieTimeLimits: function (serie, beginTimeStamp, endTimeStamp) {
            var
                begin,
                end,
                beginIndex,
                endIndex,
                data = serie.settings.serie.data,
                timeLimits = serie.settings.serie.limits && serie.settings.serie.limits.time,
                isTrimOnLeft;

            if (timeLimits) {
                begin = this.findCeil(data, beginTimeStamp);
                end = this.findFloor(data, endTimeStamp);

                if (end.index >= begin.index && end.index >= 0) {

                    beginIndex = begin.found ? begin.index - 1 : begin.index;

                    endIndex = begin.found ? end.index + 1 : end.index;
                    if (beginIndex <= timeLimits.minValueIndex && endIndex >= timeLimits.maxValueIndex) {
                        serie.settings.serie.limits = null;
                        return null;
                    }

                    if (beginIndex < 0) {
                        beginIndex = 0;
                    }

                    isTrimOnLeft = timeLimits.minValueIndex <= beginIndex;
                    timeLimits.minValueIndex = isTrimOnLeft ? endIndex : timeLimits.minValueIndex;
                    timeLimits.minValue = data[timeLimits.minValueIndex];
                    timeLimits.maxValueIndex = isTrimOnLeft ? timeLimits.maxValueIndex : beginIndex;
                    timeLimits.maxValue = isTrimOnLeft ? data[timeLimits.maxValueIndex].timeStamp : data[beginIndex].timeStamp;
                }
            }
            return timeLimits;
        },

        removeSeriesTimeLimits: function (yScaleGroup, beginTimeStamp, endTimeStamp) {
            //Note: the timestamps are the indexedData timestamps not the stream's
            var series, serie, i, serieLength;
            series = yScaleGroup.series();
            serieLength = series.length;
            for (i = 0; i < serieLength; i++) {
                serie = series[i];
                this.removeSerieTimeLimits(serie, beginTimeStamp, endTimeStamp);
            }
        },

        checkYScaleGroupsLimitsonRemove: function (yScaleGroup, beginIndex, endIndex) {
            if (yScaleGroup.settings.isAutoScale) {
                var limits = yScaleGroup.limits();
                if ((limits.minValueIndex >= beginIndex && limits.minValueIndex <= endIndex) ||
                    (limits.maxValueIndex >= beginIndex && limits.maxValueIndex <= endIndex)) {
                    yScaleGroup.limits(null);
                }
            }
        },

        findGlobalLimits: function (indexedData, yScaleGroups, beginIndex, endIndex) {
            var
                beginTimeStamp = indexedData.data[beginIndex].timeStamp,
                endTimeStamp = indexedData.data[endIndex].timeStamp,
                length = yScaleGroups.length,
                yScaleGroup, i;

            for (i = 0; i < length; i++) {
                yScaleGroup = yScaleGroups[i];
                this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
            }
        },

        removeRanges: function (indexedData, indexedDataLength, ranges, yScaleGroups) {
            var
                rangeLength = ranges.length,
                isRemoved = rangeLength,
                length = yScaleGroups.length,
                j, range, beginTimeStamp, endTimeStamp, yScaleGroup, i,
                beginIndex, endIndex;

            for (j = 0; j < rangeLength; j++) {
                range = ranges[j];
                beginIndex = range.minValueIndex >= 0 ? range.minValueIndex : 0;
                endIndex = range.maxValueIndex < indexedDataLength ? range.maxValueIndex : indexedDataLength - 1;
                beginTimeStamp = indexedData.data[beginIndex].timeStamp;
                endTimeStamp = indexedData.data[endIndex].timeStamp;
                for (i = 0; i < length; i++) {
                    yScaleGroup = yScaleGroups[i];
                    if (yScaleGroup.limits()) {
                        this.removeSeriesTimeLimits(yScaleGroup, beginTimeStamp, endTimeStamp);
                        this.checkYScaleGroupsLimitsonRemove(yScaleGroup, beginIndex, endIndex);
                    }
                }
            }
            return isRemoved;
        },

        addRanges: function (indexedData, ranges, yScaleGroups, isRemoved) {
            var
                rangeLength = ranges.length,
                length = yScaleGroups.length,
                j, range, beginTimeStamp, endTimeStamp, yScaleGroup, i,
                currentLimits;

            for (i = 0; i < length; i++) {
                yScaleGroup = yScaleGroups[i];
                currentLimits = yScaleGroup.limits();
                if (currentLimits) {
                    //if not removed range or the valuelimits have not changed
                    if (!isRemoved) {// || !yScaleGroup._dirtyValueLimits) {
                        for (j = 0; j < rangeLength; j++) {
                            range = ranges[j];

                            beginTimeStamp = indexedData.data[range.minValueIndex].timeStamp;
                            endTimeStamp = indexedData.data[range.maxValueIndex].timeStamp;

                            this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp, true);
                        }

                    } else {
                        //console.log('redoing the stream limits' + beginTimeStamp.toString() + ' ' + endTimeStamp.toString());
                        //we lost our limits so let's calculate the whole range including added but not removed
                        beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                        endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                        //console.log('lost YScale limits => need to recalculate all limits for : ' + beginIndex + ' ' + endIndex);
                        this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                    }
                } else {
                    beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                    endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                    this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                }
            }
        },

        _setIndexes: function (beginIndex, endIndex) {
            this._setBeginIndex(beginIndex);
            this._setEndIndex(endIndex);
        },
        _setBeginIndex: function (beginIndex) {
            this.indexedData.beginIndex = beginIndex;
            if (beginIndex >= 0) {
                this.indexedData.beginValue = this.indexedData.data[beginIndex].timeStamp;
            } else {
                this.indexedData.beginValue = null;
            }
        },

        _setEndIndex: function (endIndex) {
            this.indexedData.endIndex = endIndex;
            if (endIndex >= 0) {
                this.indexedData.endValue = this.indexedData.data[endIndex].timeStamp;
            } else {
                this.indexedData.endValue = null;
            }
        },



        setLimitsInRange: function (newRange) {
            log('setLimitsInRange', newRange);
            var
                indexedData = this.indexedData,
                currentRange = { minValueIndex: indexedData.beginIndex, maxValueIndex: indexedData.endIndex },
                calculateRange, yScaleGroups,
                yScaleGroup, length, i, findLimits, series, data,
                serie, k, serieLength,
                beginIndex, endIndex,
                beginTimeStamp, endTimeStamp, isRemoved,
                indexedDataLength = indexedData.data.length;

            yScaleGroups = this.getAllYScaleGroups();
            length = yScaleGroups && yScaleGroups.length;
            if (length) {
                beginIndex = newRange.minValueIndex >= 0 ? newRange.minValueIndex : 0;
                endIndex = newRange.maxValueIndex < indexedDataLength ? newRange.maxValueIndex : indexedDataLength - 1;
                this._setIndexes(beginIndex, endIndex);
                calculateRange = this.getLimitCalculationData(currentRange, newRange);

                if (calculateRange) {
                    findLimits = calculateRange === true;
                    if (findLimits) {
                        this.findGlobalLimits(indexedData, yScaleGroups, beginIndex, endIndex);
                    } else {
                        beginTimeStamp = indexedData.data[newRange.minValueIndex] && indexedData.data[newRange.minValueIndex].timeStamp;
                        endTimeStamp = indexedData.data[newRange.maxValueIndex] && indexedData.data[newRange.maxValueIndex].timeStamp;
                        length = yScaleGroups.length;
                        for (i = 0; i < length; i++) {
                            yScaleGroup = yScaleGroups[i];
                            series = yScaleGroup.series();
                            serieLength = series.length;
                            for (k = 0; k < serieLength; k++) {
                                serie = series[k];
                                data = serie.settings.serie.data;
                                if (serie.settings.serie.limits && (!data || data[0].timeStamp > endTimeStamp || data[data.length - 1].timeStamp < beginTimeStamp)) {
                                    serie.settings.serie.limits = null;
                                }
                            }
                        }
                        isRemoved = this.removeRanges(indexedData, indexedDataLength, calculateRange.removed, yScaleGroups);
                        this.addRanges(indexedData, calculateRange.added, yScaleGroups, isRemoved);
                    }
                }
            }
        },

        getTimeSettings: function (xAxis) {
            return {
                id: utilities.idGenerator('time'),
                labelAxisDistance: 13,      // (px)
                labelBorderDistance: 2,     // (px)
                markerLength: 6,            // (px)
                minLabelDistance: 30,       // (px)
                showLabels: utilities.getValue(xAxis.showLabels),
                showVerticalLines: utilities.getValue(xAxis.showVerticalLines)
            };
        },

        onXAxisShowGridChange: function (newValue) {
            //set the time axis vertical lines 
            return this.renderer.xAxis.showVerticalLines(newValue);
        },

        onXAxisShowLabelsChange: function (chartEngine, newValue) {
            //set the time axis grid 
            this.renderer.showXAxisLabels(newValue);
        },

        setXAxis: function (newAxis) {
            //if there was an old XAxis
            throw new Error('not implemented');

        },

        setRange: function () {
            //calculate new index points
            //calculate new yScaleGroups limits when series in auto
            //send chart scroll command
        },

        setMaxViewPortSize: function (newValue) {
            if (newValue < this.minViewPortSize) {
                newValue = this.minViewPortSize;
            }
            var limits = this.limits, actualLimits, minValueIndex, maxValueIndex;
            if (this.renderer.viewPortSize !== newValue) {
                this.renderer.viewPortSize = newValue;
                this._setIndexes(-20, -10);
                this._lastRange = null;
                if (typeof (limits) !== 'string') {
                    maxValueIndex = limits.maxValueIndex;
                    minValueIndex = limits.maxValueIndex - newValue + 1;
                    if (minValueIndex < 0) {
                        minValueIndex = 0;
                    }
                    actualLimits = { minValueIndex: minValueIndex, maxValueIndex: maxValueIndex };
                } else {
                    actualLimits = this.limits;
                }
                this.setLimits(actualLimits, false);
            }
            return newValue;
        },

        setMinViewPortSize: function (newValue) {
            this.minViewPortSize = newValue;
            if (this.renderer.viewPortSize < newValue) {
                this.renderer.viewPortSize = newValue;
            }
        },

        getActualLimits: function () {
            //get the limits from chartEngine
            var
                result,
                indexedData = this.indexedData,
                data = indexedData.data;

            if (data.length) {
                result = {
                    minValueIndex: indexedData.beginIndex,
                    minValue: data[indexedData.beginIndex] && data[indexedData.beginIndex].timeStamp,
                    maxValueIndex: indexedData.endIndex,
                    maxValue: data[indexedData.endIndex] && data[indexedData.endIndex].timeStamp
                };
            }
            return result;
        },

        setLimits: function (newLimits, changeVisibleBars) {
            //console.log('setLimits', newLimits);
            var
                indexedData = this.indexedData,
                minValueIndex = newLimits.minValueIndex,
                maxValueIndex = newLimits.maxValueIndex,
                result = null,
                isSpecial = true,
                yScales, i, length,
                hasData = indexedData.data.length;

            this.limits = newLimits;


            //find minValueIndex and maxValueIndex
            //  1. null || false || 'birdview' => minValueIndex = 0, maxValueIndex = indexedData.data.length -1 [goto 3]
            //  2. 'auto' => minValueIndex = indexedData.data.length - 1 - viewPortSize, maxValueIndex = indexedData.data.length - 1 [goto 3]
            //  3. {minValueIndex, maxValueIndex} => values should be a valid range
            //  4. {minValue, maxValueIndex} => minValueIndex = findFloorIndex(minValue), maxValueIndex [goto 3]
            //  5. {minValueIndex, maxValue} => minValueIndex, maxValueIndex = findCeilIndex(minValue) [goto 3]
            //  6. {minValue, maxValue} minValueIndex = findFloorIndex(minValue), maxValueIndex = findCeilIndex(minValue) [goto 3]
            //  7. {minValueIndex, minValue, maxValueIndex, maxValue} minValueIndex, maxValueIndex [goto 3]
            if (newLimits && newLimits !== 'birdview') {
                if (newLimits === 'auto') {
                    result = newLimits;
                    if (hasData) {
                        maxValueIndex = this.indexedData.data.length - 1;
                        minValueIndex = maxValueIndex - (this.renderer.viewPortSize -1 || 0);
                    } else {
                        indexedData.limits = result || newLimits;

                        yScales = this.getAllYScaleGroups();
                        length = yScales.length;

                        for (i = 0; i < length; i++) {
                            yScales[i].limits(null);
                        }
                        return result;
                    }
                } else {
                    isSpecial = false;
                    if (!newLimits.minValueIndex) {
                        minValueIndex = this.findFloorIndex(newLimits.minValue);
                    }

                    if (!newLimits.maxValueIndex) {
                        maxValueIndex = this.findCeilIndex(newLimits.maxValue);
                    }
                    //console.log('not special', maxValueIndex);
                }
            } else {
                result = newLimits || 'birdview';
                if (hasData) {
                    minValueIndex = 0;
                    maxValueIndex = this.indexedData.data.length - 1;
                } else {
                    indexedData.limits = result || newLimits;
                    return result;
                }
            }

            if (minValueIndex < 0) {
                minValueIndex = 0;
            }

            if (!isSpecial && indexedData && maxValueIndex === indexedData.data.length - 1) {
                if (minValueIndex === 0) {
                    result = "birdview";
                    changeVisibleBars = true;
                    isSpecial = true;
                } else {
                    result = "auto";
                    isSpecial = true;
                }
                //console.log('is index val', maxValueIndex);
            }

            //log('    ', 'minValueIndex: ', minValueIndex, 'maxValueIndex: ', maxValueIndex, 'this.indexedData.data.length: ', this.indexedData.data.length);
            //if(!this.testLimits){
            //    this.testLimits = 1;
            //    var o = {
            //        maxValueIndex:maxValueIndex,
            //        minValueIndex: minValueIndex - 200
            //    };
            //    this.renderer.xAxis.setLimits(o);
            //    return this.setLimits(o);
            //}

            if(minValueIndex < 0){
                minValueIndex = 0;
            }

            if(maxValueIndex >= this.indexedData.data.length){
                // throws an error - fix it!

                console.error('\n\n\nFIX RANGE ERROR\n\n\n');
                console.log('maxValueIndex: ', maxValueIndex, 'this.indexedData.data.length: ', this.indexedData.data.length);
                window.hscroll.totalRange({minValue:0, maxValue:this.indexedData.data.length});
                maxValueIndex = this.indexedData.data.length - 1;
            }


            //validates the input
            if (minValueIndex >= 0 && maxValueIndex < this.indexedData.data.length) {
                //if good, issue a range changed
                this.onRangeChanged({ minValueIndex: minValueIndex, maxValueIndex: maxValueIndex }, changeVisibleBars);
                //if is value limits
                if (!isSpecial) {
                    //update them
                    result = this.getActualLimits();
                }
            } else {
                console.error('invalid limits', minValueIndex, maxValueIndex, this.indexedData.data.length);
                throw new Error('invalid limits');
            }

            indexedData.limits = result || newLimits;
            return result;
        },



        onDrop: function (graphid, target) {
            var graph = this.getSubGraphById(graphid);
            graph.onDrop(target);
        },

        onDragEnter: function (graphid, target) {
            var graph = this.getSubGraphById(graphid);
            graph.onDragEnter(target);
        },

        onDragLeave: function (graphid, target) {
            var graph = this.getSubGraphById(graphid);
            graph.onDragLeave(target);
        },

        onDragOver: function (graphid, target) {
            var graph = this.getSubGraphById(graphid);
            graph.onDragOver(target);
        },

        showCrosshair: function (graphid, x, y) {
            return this.renderer.showCrosshair(graphid, x, y);
        },
        hideCrosshair: function () {
            return this.renderer.hideCrosshair();
        },

        changeMinDataHeight: function (graphid, minDataHeight) {
            //nothing for now
            return minDataHeight;
        },
        getGraphRect: function (graphid) {
            return this.getSubGraphById(graphid).rect();
        },

        addGraph: function (graph, index) {
            var item,
                initialSettings;

            initialSettings = this.getGraphSettings(graph);
            if (index >= 0 && index < this.renderer.subGraphs().length) {
                this.renderer.subGraphs.splice(index, 0, initialSettings);
            } else {
                this.renderer.subGraphs.push(initialSettings);
                index = this.renderer.subGraphs().length - 1;
            }
            item = this.renderer.subGraphs(index);

            this.initGraph(initialSettings);

            this._setIndexes(-20, -10);
            this._lastRange = null;
            this.setLimits(this.rendererSettings.xAxis.limits);

            this.distributeGraphs(this.rendererSettings.graphs);

            graph.id = item.id;

            this.triggerLimitChange();

            return graph;
        },

        updateGraph: function (index, graph, oldGraph) {
            throw new Error('updateGraph not implemented');
            //TODO: pending conversation about id persistence
        },

        removeGraphs: function (index, graphs, cleanup) {
            var
                k,
                graphLength = graphs && graphs instanceof Array ? graphs.length : 1,
                i, length, yScaleGroups, series, seriesLength, j,
                lostIndexedDataPoints = false,
                serie, graph;

            cleanup = cleanup || cleanup === undefined;

            for (k = 0; k < graphLength; k++) {
                graph = this.renderer.subGraphs(index);


                yScaleGroups = graph.yScaleGroups();
                length = yScaleGroups.length;
                for (i = 0; i < length; i++) {
                    series = yScaleGroups[i].series();
                    seriesLength = series.length;
                    for (j = 0; j < seriesLength; j++) {
                        serie = series[j];
                        lostIndexedDataPoints = this.removeDataRange(serie.settings.serie.data) || lostIndexedDataPoints;
                    }
                }

                this.renderer.subGraphs.splice(index, 1);
            }

            if (lostIndexedDataPoints && cleanup) {
                this.compactIndexedData(true);
            }

            return lostIndexedDataPoints;
        },

        clearGraphs: function () {
            return this.removeGraphs(0, this.renderer.subGraphs(), true);
        },

        distributeGraphs: function (graphs) {
            var
                length = graphs.length,
                i,
                realEstatePercent,
                accum = 0,
                chartPercents = [];

            for (i = 0; i < length; i++) {
                realEstatePercent = utilities.getValue(graphs[i].realEstatePercentage);
                chartPercents[i] = realEstatePercent;
                accum += realEstatePercent;
            }

            return this.setGraphPercentages(chartPercents, accum !== 1);
        },

        setGraphPercentages: function (percentages, normalize) {
            var
                length = percentages.length,
                i, realEstatePercent,
                accum = 0,
                contribution,
                chartPercents = normalize ? [] : percentages;

            if (normalize) {
                contribution = [];
                for (i = 0; i < length; i++) {
                    realEstatePercent = percentages[i];
                    contribution[i] = realEstatePercent;
                    accum += realEstatePercent;
                }
                for (i = 0; i < length; i++) {
                    chartPercents[i] = 100 * contribution[i] / accum;
                }
            }

            this.renderer.subGraphSizeChanged(chartPercents);

            return chartPercents;
        },

        getScaleSettings: function (yScaleGroup) {
            var
                i, length, series,initialSettings, serieSettings,
                limits = utilities.getValue(yScaleGroup.limits),
                isAutoScale = limits === 'auto';

            if (isAutoScale) {
                limits = {
                    minValue: 0,
                    maxValue: 0
                };
            }

            series = utilities.getValue(yScaleGroup.series);
            length = series && series.length;
            initialSettings = {
                id: utilities.getValue(yScaleGroup.id) || utilities.idGenerator('group'),
                axisPosition: utilities.getValue(yScaleGroup.position),
                showLabels: utilities.getValue(yScaleGroup.showLabels),
                showHorizontalLines: utilities.getValue(yScaleGroup.showHorizontalLines),
                scaler: utilities.getValue(yScaleGroup.scalingType) === scalerTypes.semilog ? new LogarithmicScaler() : new LinearScaler(),
                minMove: utilities.getValue(yScaleGroup.minMove),
                limits: limits,
                numberFormat: utilities.getValue(yScaleGroup.numberFormat),
                formatter: utilities.getFormatter(utilities.getValue(yScaleGroup.numberFormat)),
                series: []
            };

            if (yScaleGroup._settings) {
                yScaleGroup._settings.id = initialSettings.id;
            }
            yScaleGroup.id = initialSettings.id;

            for (i = 0; i < length; i++) {
                serieSettings = this.getSerieSettings(series[i]);
                initialSettings.series.push(serieSettings);
            }

            initialSettings.isAutoScale = isAutoScale;

            return initialSettings;
        },

        addScaleGroup: function (graphId, yScaleGroup, index) {
            log('addScaleGroup', graphId, yScaleGroup, index);
            var item,
                subgraph,
                initialSettings,
                limits = yScaleGroup.limits(),
                isAutoScale = limits === 'auto';

            if (isAutoScale) {
                limits = {
                    minValue: 0,
                    maxValue: 0
                };
            }

            initialSettings = this.getScaleSettings(yScaleGroup);
            subgraph = this.getSubGraphById(graphId);

            log('    initialSettings', initialSettings.limits.maxValueIndex, initialSettings.limits.minValueIndex);

            if (index >= 0 && index < subgraph.yScaleGroups().length) {
                log('    within range(?)');
                subgraph.yScaleGroups.splice(index, initialSettings);
            } else {
                log('    use initialSettings');
                subgraph.yScaleGroups.push(initialSettings);
                index = subgraph.yScaleGroups().length - 1;
                log('    index', index);
            }

            log('    initAxis...');
            this.initAxis(subgraph, initialSettings);

            this._setIndexes(-20, -10);
            this._lastRange = null;

            log('    setLimits....', this.rendererSettings.xAxis.limits);
            this.setLimits(this.rendererSettings.xAxis.limits);

            item = subgraph.yScaleGroups(index);
            item.settings.isAutoScale = isAutoScale;
            this.triggerLimitChange();
            return item;
        },

        updateScaleGroup: function () {
            throw new Error('not implemented');
        },

        removeScaleGroup: function (graphId, index, compactData) {

            var graph, yScaleGroup, series, seriesLength, j,
                lostIndexedDataPoints = false,
                serie;

            compactData = compactData || compactData === undefined;

            graph = this.getSubGraphById(graphId);
            yScaleGroup = graph.yScaleGroups(index);

            series = yScaleGroup.series();
            seriesLength = series.length;

            for (j = 0; j < seriesLength; j++) {
                serie = series[j];
                lostIndexedDataPoints = this.removeDataRange(serie.settings.serie.data) || lostIndexedDataPoints;
            }
            graph.yScaleGroups.splice(index, 1);

            if (compactData && lostIndexedDataPoints) {
                this.compactIndexedData(true);
            }
            return lostIndexedDataPoints;
        },

        clearScaleGroups: function (graphId) {
            var
                lostIndexedDataPoints = false,
                i,
                graph = this.getSubGraphById(graphId),
                yScaleGroups = graph.yScaleGroups(),
                length = yScaleGroups && yScaleGroups.length;

            for (i = 0; i < length; i++) {
                lostIndexedDataPoints = this.removeScaleGroup(graphId, 0, false) || lostIndexedDataPoints;
            }
            if (lostIndexedDataPoints) {
                this.compactIndexedData(true);
            }
            return lostIndexedDataPoints;
        },

        allowSelection: function () {

        },

        allowGraphResizing: function () {

        },

        allowDrawingObjectResizing: function () {

        },
        
        setHeader: function (graphId, header) {
            this.changeHeaderElement(graphId, header.domElement());
            this.setOnHeaderRectChanged(graphId, header.onRectChanged());
            this.changeHeaderHeight(graphId, header.height());
        },

        changeHeaderElement: function (graphId, domElement) {
            this.getSubGraphById(graphId).headerDomElement(domElement);
        },

        setOnHeaderRectChanged: function (graphId, onHeaderRectChanged) {
            this.getSubGraphById(graphId).onHeaderRectChanged(onHeaderRectChanged);
        },

        changeHeaderHeight: function (graphId, newHeight) {
            var
                subgraph = this.getSubGraphById(graphId);

            if(subgraph.headerHeight){
                subgraph.headerHeight(newHeight);
            }
        },

        changeAxisPosition: function (graphId, yScaleGroupId, position) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            this.renderer.axisPositionChanged(graphId, yScaleGroupId, position);
            return yScaleGroup.axisPosition();
        },

        showYAxisLines: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            yScaleGroup.axis.showHorizontalLines(value);
            return yScaleGroup.axis.showHorizontalLines();
        },

        showYAxisLabels: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            this.renderer.showYAxisLabels(graphId, yScaleGroupId, value);
            return yScaleGroup.axis.showLabels();
        },

        getYScaleActualLimits: function (graphId, yScaleGroupId) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            return yScaleGroup.limits();
        },

        setYLimits: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                indexedData = this.indexedData,
                data = indexedData.data,
                isAutoScale = value === 'auto';

            if (isAutoScale) {
                yScaleGroup.settings.isAutoScale = true;
                if (data.length) {
                    this.setYScaleLimitsInRange(yScaleGroup, data[indexedData.beginIndex].timeStamp, data[indexedData.endIndex].timeStamp);
                }
                //recalculate limits in the YScaleGroup
                //throw new Error('not implemented yet';
            } else {
                yScaleGroup.limits(value);
                yScaleGroup.settings.isAutoScale = false;
            }
            return yScaleGroup.limits();
        },

        setScalingType: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                scaler = value === scalerTypes.semilog ? new LogarithmicScaler() : new LinearScaler();
            yScaleGroup.scaler(scaler);
            return yScaleGroup.scaler();
        },

        getScaler: function (graphId, yScaleGroupId) {
            var yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            return yScaleGroup.scaler();
        },

        setNumberFormat: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                formatter = utilities.getFormatter(value);
            yScaleGroup.axis.numberFormat(value);
            yScaleGroup.axis.formatter(formatter);
        },

        setMinMove: function (graphId, yScaleGroupId, value) {
            var yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            yScaleGroup.axis.labelRenderer.minMove(value);
            return yScaleGroup.axis.labelRenderer.minMove();
        },

        getSerieSettings: function (serie) {
            var
                i,
                layers = utilities.getValue(serie.layers),
                length = layers && layers.length,
                serieSectionSettings,
                //if there is a value for defineScaling or there is a value inside of settings or true
                definesScaling = serie.definesScaling !== undefined ? serie.definesScaling :
                    (serie._settings && serie._settings.definesScaling !== undefined) ? serie._settings.definesScaling : true,
                initialSettings = {
                    id: serie.id || utilities.idGenerator('serie'),
                    inputs: utilities.getValue(serie.inputs),
                    data: utilities.getValue(serie.data),
                    limits: null,
                    sections: [],
                    definesScaling: definesScaling
                };
                
            if (serie._settings) {
                serie._settings.id = initialSettings.id;
            }
            serie.id = initialSettings.id;

            for (i = 0; i < length; i++) {
                serieSectionSettings = this.getSerieSectionSettings(layers[i]);
                initialSettings.sections.push(serieSectionSettings);
            }

            return initialSettings;
        },

        addSerie: function (graphId, yScaleGroupId, serie, index) {
            var
                yScaleGroup,
                item,
                hasData,
                initialSettings = this.getSerieSettings(serie);

            yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            if (index >= 0 && index < yScaleGroup.series().length) {
                yScaleGroup.series.splice(index, initialSettings);
            } else {
                yScaleGroup.series.push(initialSettings);
                index = yScaleGroup.series().length - 1;
            }
            item = yScaleGroup.series(index);

            hasData = this.indexedData.data.length;

            this.addDataRange(graphId, yScaleGroupId, serie.id, utilities.getValue(serie.data));

            if (hasData) {
                //calculate limits for the axis only
                this.calculateYScaleLimits(yScaleGroup);
            } else {
                //calculate the limits
                this._setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.rendererSettings.xAxis.limits);
            }
            this.triggerLimitChange();
            return item;
        },

        updateSerie: function (graphId, yScaleGroupId, serie, previousSerie) {
            throw new Error('not implemented');
        },

        removeSeries: function (graphId, yScaleGroupId, index, removed) {
            var
                i,
                length = removed && removed instanceof Array ? removed.length : 1,
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                serie,
                lostIndexedDataPoint = false;

            for (i = 0; i < length; i++) {
                serie = yScaleGroup.series(index);
                //remove the data from indexedData
                lostIndexedDataPoint = this.removeDataRange(serie.settings.serie.data) || lostIndexedDataPoint;
                //remove the serie from the group
                yScaleGroup.series.splice(index, 1);
            }

            if (lostIndexedDataPoint) {
                this.compactIndexedData(true);
            }


            this.calculateYScaleLimits(this.getYScaleGroupById(graphId, yScaleGroupId));

            return lostIndexedDataPoint;
        },

        clearYScaleGroupData: function (yScaleGroup) {
            var
                series = yScaleGroup.series(),
                length = series.length,
                serie,
                i;
                
            for (i = 0; i < length; i++) {
                serie = series[i];
                //remove the data from indexedData
                this.removeDataRange(serie.settings.serie.data);
            }
        },

        clearSeries: function (graphId, yScaleGroupId) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                series = yScaleGroup.series();

            this.removeSeries(graphId, yScaleGroupId, 0, series);
            yScaleGroup.render();
        },

        setDefinesScaling: function () {
            throw new Error('not implemented');
        },

        //#region Layers
        getSerieSectionSettings: function (layer) {
            var
                result,
                sectionDatapointDefinitions = [],
                layerDataPointDefintion,
                validator = [],
                indicationNumber, formatter, length, i,
                layerDataPointDefinitions = utilities.getValue(utilities.getValue(layer.chartType).dataPointDefinitions);

            if (layerDataPointDefinitions) {
                length = layerDataPointDefinitions.length;

                for (i = 0; i < length; i++) {
                    layerDataPointDefintion = layerDataPointDefinitions[i];
                    indicationNumber = layerDataPointDefintion.indication;
                    if (layerDataPointDefintion.indication && indicationNumber >= 0) {
                        if (indicationNumber === true) {
                            indicationNumber = i;
                        }
                        if (validator[indicationNumber]) {
                            throw new Error('duplicated indication order: ' + indicationNumber);
                        } else {
                            validator[indicationNumber] = indicationNumber;
                        }
                    } else {
                        indicationNumber = undefined;
                    }
                    formatter = layerDataPointDefintion.numberFormat ? utilities.getFormatter(layerDataPointDefintion.numberFormat) : layerDataPointDefintion.numberFormat;
                    sectionDatapointDefinitions.push({
                        key: layerDataPointDefintion.key,
                        indication: indicationNumber,
                        formatter: formatter
                    });
                }
            }

            result = {
                id: layer.id || utilities.idGenerator('serie'),
                isSelected: utilities.getValue(layer.isSelected),
                dataPointDefinitions: sectionDatapointDefinitions,
                chartType: utilities.getValue(utilities.getValue(layer.chartType).name),
                style: utilities.getValue(utilities.getValue(layer.chartType).settings) || layer._settings.chartType.settings
            };

            if (layer._settings) {
                layer._settings.id = result.id;
                if(!result.chartType && layer._settings.chartType){
                    // fix for some comlpicated, unknown problem
                    result.chartType = layer._settings.chartType.name;
                }
            }
            layer.id = result.id;
            return result;
        },

        addLayer: function (graphId, yScaleGroupId, serieId, layer, index) {

            var
                item,
                serie,
                length,
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                layerDataPointDefinitions = layer.chartType().dataPointDefinitions(),
                initialSettings = this.getSerieSectionSettings(layer);

            serie = this.getSerieById(graphId, yScaleGroupId, serieId);
            //reset the paintable points cache
            serie._paintablePoints = undefined;

            if (index >= 0 && index < serie.sections().length) {
                yScaleGroup.insertSerieSection(serieId, index, initialSettings);
                serie.sections.splice(index, initialSettings);
            } else {
                yScaleGroup.addSerieSection(serieId, initialSettings);
                //serie.sections.push(initialSettings);
                index = serie.sections().length - 1;
            }
            item = serie.sections(index);
            this.calculateYScaleLimits(this.getYScaleGroupById(graphId, yScaleGroupId));
            return item;
        },

        updateLayer: function (graphId, yScaleGroupId, serieId, layer, oldLayer, index) {
            this._removeLayer(graphId, yScaleGroupId, serieId, index);
            return this.addLayer(graphId, yScaleGroupId, serieId, layer, index);
        },

        _removeLayer: function (graphId, yScaleGroupId, serieId, index, layers) {

            var i,
                length = layers && layers instanceof Array ? layers.length : 1,
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                serie = this.getSerieById(graphId, yScaleGroupId, serieId);

            //reset the paintable points cache
            serie._paintablePoints = undefined;

            for (i = 0; i < length; i++) {
                yScaleGroup.removeSerieSection(serieId, index);
            }

            return layers;
        },

        removeLayer: function (graphId, yScaleGroupId, serieId, index, layers) {
            var
                result = this._removeLayer(graphId, yScaleGroupId, serieId, index, layers);

            this.calculateYScaleLimits(this.getYScaleGroupById(graphId, yScaleGroupId));
            return result;
        },

        clearLayers: function (graphId, yScaleGroupId, serieId) {
            var
                serie = this.getSerieById(graphId, yScaleGroupId, serieId);
            serie.sections([]);
            //reset the paintable points cache
            serie._paintablePoints = undefined;
            this.calculateYScaleLimits(this.getYScaleGroupById(graphId, yScaleGroupId));
        },

        setInputs: function (graphId, yScaleGroupId, serieId, newInputs) {
            var
                serie = this.getSerieById(graphId, yScaleGroupId, serieId);
            serie.settings.serie.inputs = newInputs;
            serie.render();
        },

        selectLayer: function (graphId, yScaleGroupId, serieId, layerId, newValue) {
            var
                section = this.getSectionById(graphId, yScaleGroupId, serieId, layerId);
            section.isSelected(newValue);
            return section.isSelected();
        },

        addDataRange: function (graphId, yScaleGroupId, serieId, data, analyzeLimits) {
            log('addDataRange');
            var
                length = data.length,
                i,
                indexedDataStorage = this.indexedData.data,
                indexedDataPoint;

            if (indexedDataStorage.length) {
                //adding to indexData
                for (i = 0; i < length; i++) {
                    this.addDataPointToIndexedData(data[i], false);
                }
            } else {
                //if no indexedData, we just add it
                //NOTE: data is supposed to be sorted
                //by timeStamp ascending
                for (i = 0; i < length; i++) {
                    indexedDataPoint = {
                        timeStamp: data[i].timeStamp,
                        streamCount: 1
                    };
                    data[i].indexedDataPoint = indexedDataPoint;
                    indexedDataStorage.push(indexedDataPoint);
                }
            }
            if (analyzeLimits) {
                this._setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.indexedData.limits);
                this.render();
            }
        },

        removeDataRange: function (data) {
            var
                i, length = data.length,
                dataPoint, indexedDataPoint, result = false;
            for (i = 0; i < length; i++) {
                dataPoint = data[i];
                indexedDataPoint = dataPoint.indexedDataPoint;
                indexedDataPoint.streamCount--;
                result = result || indexedDataPoint.streamCount === 0;
            }
            return result;
        },

         triggerLimitChange: function () {
            // calls onLimitsChanged in app
            if (this.onLimitsChanged) {
                this.onLimitsChanged({
                    limits: this.getActualLimits(),
                    total: this.indexedData.data.length-1
                });
            }
        },

        compactIndexedData: function (calculate) {
            var
                indexedData = this.indexedData,
                data = indexedData.data,
                endTimeStamp = data[indexedData.endIndex].timeStamp,
                i, length = data.length,
                indexedDataPoint, j = 0;

            for (i = 0; i < length; i++) {
                indexedDataPoint = data[i];
                if (indexedDataPoint.streamCount) {
                    data[j] = data[i];
                    j++;
                }
            }
            data.length = j;
            if (calculate) {
                this.calculateNewTimeLimits(endTimeStamp);
            } else {
                if (!j) {
                    this._setIndexes(-20, -10);
                }
            }

            this.triggerLimitChange();
        },

        calculateNewTimeLimits: function (endTimeStamp) {
            var
                indexedData = this.indexedData,
                data = indexedData.data,
                viewPortSize = this.renderer.viewPortSize,
                endsearchIndex,
                length = data.length;
            if (length) {

                endsearchIndex = this.findCeilIndex(data, endTimeStamp);

                if (endsearchIndex >= data.length) {
                    endsearchIndex = data.length - 1;
                }

                if (endsearchIndex >= viewPortSize - 1) {
                    this._setIndexes(endsearchIndex - (viewPortSize - 1), endsearchIndex);
                } else {
                    this._setBeginIndex(0);

                    if (length > viewPortSize) {
                        this._setEndIndex(viewPortSize - 1);
                    } else {
                        this._setEndIndex(length - 1);
                    }
                }
            } else {
                this._setIndexes(-20, -10);
                //this.chart.xAxis().limits({})
                //this.chart.xAxis().settings.limits = {minValue:null, maxValue:null, minValueIndex:0, maxValueIndex:0};
                this.chart.xAxis().settings.limits = 'auto';
            }
        },

        addToIndexedData: function (indexedData, datapoint) {
            //add it to indexedData
            var
                indexedDataPoint,
                search = utilities.binarySearch(indexedData, datapoint, utilities.timeStampedObjectComparator);

            if (!search.found) {
                indexedDataPoint = {
                    timeStamp: datapoint.timeStamp,
                    streamCount: 1
                };
                if (search.index < 0) {
                    search.index = 0;
                }
                indexedData.splice(search.index, 0, indexedDataPoint);
            } else {
                indexedDataPoint = indexedData[search.index];
                indexedDataPoint.streamCount++;
            }

            //while painting, quickly find the indexed point and its viewPortPixel
            datapoint.indexedDataPoint = indexedDataPoint;

            return search;
        },

        addDataPointToIndexedData: function (datapoint, isNew) {
            var
                indexedData = this.indexedData,
                indexedDataPoint,
                isNewIndexedData,
                indexedDataSearch;

            //setting the last datapoint
            if (!isNew) {
                indexedDataPoint = datapoint.indexedDataPoint;
                isNewIndexedData = !indexedDataPoint;
                if (isNewIndexedData) {
                    indexedDataSearch = this.addToIndexedData(indexedData.data, datapoint);
                } else {
                    indexedDataSearch = { found: true };
                }
            } else {
                indexedDataSearch = this.addToIndexedData(indexedData.data, datapoint);
            }
            return indexedDataSearch;
        },

        isInPaintableRange: function (indexedData, dpTimeStamp, isNewIndexedData) {
            var
                endTimeStamp,
                beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp,
                result = dpTimeStamp >= beginTimeStamp;

            if (result) {
                endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                result = dpTimeStamp <= endTimeStamp;
                if (!result) {
                    //at the end?
                    result = !indexedData.data[indexedData.endIndex + (isNewIndexedData ? 2 : 1)];
                }
            }
            return result;
        },

        isRealTime: function (indexedData, isNewData) {
            var
                offset = isNewData ? 2 : 1;

            return !!indexedData.data[indexedData.endIndex + offset];
        },

        //updateDataValue: function (graphId, yScaleGroupId, serieId, datapoint, index) {
        //    this.addData(graphId, yScaleGroupId, serieId, datapoint, index, true);
        //},

        addData: function (graphId, yScaleGroupId, serieId, datapoint, index, found) {
            //log('addData');
            var
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                serie = this.getSerieById(graphId, yScaleGroupId, serieId),
                indexedData = this.indexedData,
                dataLength = indexedData.data.length,
                isBirdView,
                isOverflowed,
                isSpecial = !dataLength || (indexedData.limits && !!indexedData.limits.length),
                lastTimeStamp = dataLength && indexedData.data[dataLength - 1].timeStamp,
                dpTimeStamp = datapoint.timeStamp,
                maxValueIndex,
                minValueIndex,
                limits,
                minValue,
                maxValue,
                isHistoryorVisible = isSpecial || dpTimeStamp <= lastTimeStamp,
                isPast,
                addedRange,
                removedRange,
                isInPaintableRange,
                indexedDataSearch,
                isNew;


            //if is in the past
            //  scroll indexedData and calculate new stream time limits for the affected stream
            //if is in the viewable area
            //  increment endIndex on Indexed Data
            //  if viewport overflow, increment beginIndex in the data
            //  calculate new limits for the yScaleGroup
            //  calculate new timeLimits for all the streams
            //if is realtime
            // same as above
            //else do nothing

            //if limits is special =>
            //  if new,
            //      we need to set Limits
            //else
            //  if new and index <=endindex
            //      we need to scroll to endindex+1-viewportsize until endindex+1
            // if not new but in paintable area
            //  if combine limits for the YScaleGroup
            //  renderIndex

            indexedDataSearch = this.addDataPointToIndexedData(datapoint, !found);
            isNew = !indexedDataSearch.found;

            isBirdView = indexedData.limits === 'birdview';
            isPast = dataLength && !isBirdView && dpTimeStamp < indexedData.data[indexedData.beginIndex].timeStamp;

            if (!isPast) {
                //if is Special and isNew, set whatever limits we are supposed to have
                if (isSpecial && isNew) {
                    //reset indexedData
                    this._setIndexes(-20, -10);
                    this.setLimits(indexedData.limits);
                    this.render();
                } else {
                    isInPaintableRange = isSpecial || this.isInPaintableRange(indexedData, datapoint.timeStamp, isNew);
                    //if it is still new and is history or visible, then we need to shift to the right
                    //TODO: optimize that only the affected stream limits are affected and the indexed data
                    if (isNew && isInPaintableRange) {
                        //scroll by one the end
                        this._setIndexes(-20, -10);
                        this.setLimits(indexedData.limits);
                        this.render();
                    } else
                        //if not new and in viewport and the yScaleGroup is auto
                        if (!isNew && isInPaintableRange && yScaleGroup.settings.isAutoScale) {
                            limits = yScaleGroup.limits();
                            if (limits) {
                                minValue = limits.minValue;
                                maxValue = limits.maxValue;
                                this.processSerieValueLimits(serie, index, index, limits);
                                //if the limits changed => render yScaleGroup
                                if (limits.minValue !== minValue || limits.maxValue !== maxValue) {
                                    log('addData.change limits', limits);
                                    yScaleGroup.limits(limits);
                                    yScaleGroup.render();
                                } else {
                                    //let's just render the value
                                    serie.renderIndex(index);
                                }
                            }
                        }
                }
            } else {
                this._setIndexes(indexedData.beginIndex + 1, indexedData.endIndex + 1);
                //fix the affected stream time limits
                this.findTimeLimitsInSerieRange(serie, indexedData.beginValue, indexedData.endValue);
                //do nothing else because the other streams limits should have been kept the same
                this.scroll();
            }

            //if the index is the last in the serie
            //update indication
            if (index === serie.settings.serie.data.length - 1) {
                yScaleGroup.renderIndication(serieId);
            }

        },

        removeData: function (graphId, yScaleGroupId, serieId, removedData) {
            var
                lostIndexedDataPoints = this.removeDataRange(removedData),
                yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
                serie = this.getSerieById(graphId, yScaleGroupId, serieId);

            if (lostIndexedDataPoints) {
                this.compactIndexedData(true);
            }

            this._setIndexes(-20, -10);
            serie.settings.serie.limits.time = null;
            this.setLimits(this.indexedData.limits);

            yScaleGroup.renderIndication(serieId);

            return lostIndexedDataPoints;
        },

        changeChartType: function (graphId, yScaleGroupId, serieId, layerId, chartType, datapointDefinitions) {
            var yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId);
            yScaleGroup.changeSerieSectionChartType(serieId, layerId, chartType.name(), chartType.settings(), chartType.dataPointDefinitions());
        },

        render: function () {
            this.renderer.render();
        },

        scroll: function () {
            this.renderer.scroll();
        },

        dataInspectByYScaleGroupObject: function (yScaleGroup, serieIndex, serie, timeStamp) {
            var
                serieData,
                search = utilities.binarySearch(serie.settings.serie.data, timeStamp, utilities.mixTimeStampComparator);
            if (search.found) {
                serieData = yScaleGroup.dataInspect(search.index, serieIndex);
            }
            return serieData;
        },

        dataInspectBySerie: function (graphId, axisId, serieId, timeStamp) {
            var
                yScaleGroup = this.getYScaleGroupById(graphId, axisId),
                serie = yScaleGroup.seriesMap[serieId].object,
                serieIndex = this.findSerieIndex(yScaleGroup, serieId);

            return this.dataInspectByYScaleGroupObject(yScaleGroup, serieIndex, serie, timeStamp);
        },

        hitTest: function (chartSettingsObject, subgraphId, x, y) {
            var
                subGraph = this.getSubGraphById(subgraphId),
                target = subGraph.hitTest(x, y);

            return this._createExternalEventObject(chartSettingsObject, { target: target });
        },

        dataInspect: function (subgraphId, timeStamp) {
            var
                subGraph = this.getSubGraphById(subgraphId),
                search, index, axis, serieData,
                yScaleGroups, yScaleGroupsLength, i, yScaleGroup, streamsOnSpot,
                series, seriesLength, j, serie,
                result = null;

            yScaleGroups = subGraph.yScaleGroups();
            yScaleGroupsLength = yScaleGroups.length;
            if (yScaleGroupsLength) {
                search = utilities.binarySearch(this.indexedData.data, timeStamp, utilities.mixTimeStampComparator);
                if (search.found) {

                    index = search.index;

                    streamsOnSpot = this.indexedData.data[index].streamCount;

                    if (streamsOnSpot) {
                        result = { axes: [] };
                        for (i = 0; i < yScaleGroupsLength; i++) {
                            axis = {
                                series: []
                            };
                            result.axes.push(axis);
                            yScaleGroup = yScaleGroups[i];
                            series = yScaleGroup.series();
                            seriesLength = series.length;
                            for (j = 0; j < seriesLength; j++) {
                                serie = series[j];
                                serieData = this.dataInspectByYScaleGroupObject(yScaleGroup, j, serie, timeStamp) || {}; // serie.dataInspect(index);
                                axis.series.push(serieData);
                            }
                        }
                    }
                }
            }
            return result;
        },

        dispose: function () {
            this.renderer.dispose();
            delete this.renderer;
            delete this.rendererSettings;
        }
    });

});
