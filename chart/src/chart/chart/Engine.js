define([
    'dcl/dcl',
    'jquery',
    '../defaults',
    'common/Utilities',
    './Renderer',
    './IndexedData',
    'localLib/logger'
], function (dcl, $, defaults, utilities, Renderer, IndexedData, logger) {

    var
        loggingEnabled = 0,
        log = logger('E', loggingEnabled, 'Chart Engine'),
        logIndexData = logger('EID', loggingEnabled, 'Chart Engine Index Data Logs');

    function notSupported() {
        throw new Error('operation is not supported');
    }

    return dcl(null, {
        declaredClass:'Engine',
        
        catchRenderErrors:false,

        constructor: function($parent, settings, chart){
            log('Chart Engine loaded');
            if(loggingEnabled){
                window.engine = this;
            }

            // indexedData needs to be set before getting settings
            this.indexedData = new IndexedData(this);
            this.indexedData.on('change-range', this.onRangeChanged, this);
            this.indexedData.on('trigger-render', this.render, this);
            this.indexedData.on('trigger-scroll', this.scroll, this);
            this.indexedData.on('trigger-limit-change', this.triggerLimitChange, this);

            this.eventTree = settings.eventTree;

            this.eventTree.on(this.eventTree.events.chartType, function(event){
                this.calculateYScaleLimits(event.group);
                this.render();
            }, this);

            var
                i,
                totalPercentage = 0;

            this._$parent = $parent;
            this.xAxisLimits = settings.xAxis.limits;
            this.chart = chart;
            this.id = utilities.uid('engine');

            
            this.minViewPortSize = settings.xAxis.minimumNumberOfVisibleBars;
            this.onLimitsChanged = settings.xAxis.onLimitsChanged;
            this.onTotalRangeMaxChanged = settings.xAxis.onTotalRangeMaxChanged;

            this.eventTree.on(this.eventTree.events.dataPoint, function(event){
                this.addData(event);
            }, this);

            this.eventTree.on(this.eventTree.events.data, function(event){
                this.addDataRange(event);
            }, this);

            this.eventTree.on(this.eventTree.events.updateGroup, function(event){
                // includes remove serie
                this.render();
            }, this);

            // should get graph events before renderer
            this.eventTree.on(this.eventTree.events.addGraph, this.onAddGraph, this);
            this.eventTree.on(this.eventTree.events.beforeRemoveGraph, this.onBeforeRemoveGraph, this);
            this.eventTree.on(this.eventTree.events.removeGraph, this.onRemoveGraph, this);
            
            this.renderer = new Renderer($parent, {
                eventTree: this.eventTree,
                painterFactory: chart.painterFactory,
                resourceManager: chart.resourceManager,
                indexedData: this.indexedData,
                onViewPortLeftMarginChange: chart.onViewPortLeftMarginChange.bind(chart),
                onViewPortRightMarginChange: chart.onViewPortRightMarginChange.bind(chart),
                subGraphs: settings.graphs,
                timeAxis: this.getTimeSettings(settings.xAxis),
                theme: settings.theme
            }, this.chart);


            this.renderer.viewPortSize = settings.xAxis.maximumNumberOfVisibleBars;

            this.indexedData.setIndexes(-20, -10);
            this._lastRange = null;

            // indexedData is set by this time
            this.setLimits(settings.xAxis.limits);


            // TODO
            // I think this may happen later, and
            // distributeGraphs doesn't accept a number anyway
            // 
            for (i = 0; i < settings.graphs.length; i++) {
                totalPercentage += settings.graphs[i].realEstatePercentage || 0;
            }
            if (totalPercentage !== 1) {
                this.distributeGraphs(totalPercentage);
            }

            //this.renderer.graphs.add(settings.graphs);
        },

        // Move to renderer?
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



        //
        //  GETTERS
        //

        getChain: function(id){
            return this.renderer.graphs.getChain(id);
        },

        getSubGraphById: function (graphId) {
            return this.renderer.graphs.get(graphId);
        },

        getGroupById: function (yScaleGroupId) {
            var chain = this.renderer.graphs.getChain(yScaleGroupId);
            return chain ? chain.group : null;
        },

        getSerieById: function (serieId) {
            var chain = this.renderer.graphs.getChain(serieId);
            return chain ? chain.serie : null;
        },

        getSectionById: function (sectionId) {
            var chain = this.renderer.graphs.getChain(sectionId);
            return chain ? chain.section : null;
        },

        getGroups: function () {
            var
                subgraphs = this.renderer.subGraphs(), i,
                subgraphLength = subgraphs.length,
                yScaleGroups,
                result = [];
            for (i = 0; i < subgraphLength; i++) {
                yScaleGroups = subgraphs[i].groups.get();//yScaleGroups();
                result = result.concat(yScaleGroups);
            }
            return result;
        },



        //
        //  GRAPH METHODS
        //

        onAddGraph: function(event){
            console.log('ENGINE ADD GRAPH', event.graph.id);
            var limits = this.chart.xAxis ? this.chart.xAxis().limits() : this.xAxisLimits;
            this.indexedData.setIndexes(-20, -10);
            this._lastRange = null;
            this.setLimits(limits); // obviously needs to change
            this.calculateGraphLimits(event.graph);
            this.distributeGraphs();
            this.triggerLimitChange();
        },

        onBeforeRemoveGraph: function(event){
            console.log('REMOVE GRAPH', event.graph.id);
            var i, lostIndexedDataPoints, series = event.graph.getAllSeries();
            for(i = 0; i < series.length; i++){
                lostIndexedDataPoints = this.indexedData.removeDataRange(series[i].settings.serie.data) || lostIndexedDataPoints;
            }

            if (!lostIndexedDataPoints) {
                //refresh range
                this.setLimits(this.chart.xAxis().limits());
            } else {
                this.calculateChartLimits();
            }
        },

        onRemoveGraph: function(event){
            this.distributeGraphs();
            this.render();
        },
        
        clearGraphs: function () {
            this.renderer.graphs.clear();
            this.indexedData.compact(true);
            this.setLimits(this.chart.xAxis().limits());
            this.render();
        },

        distributeGraphs: function () {
            this.renderer.distributeGraphs();
        },

        calculateChartLimits: function () {
            var
                subGraphs = this.renderer.subGraphs(),
                length = subGraphs.length, i;

            for (i = 0; i < length; i++) {
                this.calculateGraphLimits(subGraphs[i]);
            }
        },

        calculateGraphLimits: function (graph) {
            if (this.indexedData.data.length) {
                console.log('CALC', graph.id, graph.declaredClass, graph.groups, graph);
                var
                    yScaleGroups = graph.groups.get(),
                    length = yScaleGroups.length, i;

                for (i = 0; i < length; i++) {
                    this.calculateYScaleLimits(yScaleGroups[i]);
                }
            }
        },


        //
        // GROUP METHODS
        //



        clearYScaleGroupData: function (yScaleGroup) {
            var
                series = yScaleGroup.series.get(),
                length = series.length,
                serie,
                i;

            for (i = 0; i < length; i++) {
                serie = series[i];
                //remove the data from indexedData
                this.indexedData.removeDataRange(serie.settings.serie.data);
            }
        },

        removeScaleGroup: function (graphId, index, compactData) {

            var graph, yScaleGroup, series, seriesLength, j,
                lostIndexedDataPoints = false,
                serie;

            compactData = compactData || compactData === undefined;

            graph = this.getSubGraphById(graphId);
            yScaleGroup = graph.groups.get(index);

            series = yScaleGroup.series.get();
            seriesLength = series.length;

            for (j = 0; j < seriesLength; j++) {
                serie = series[j];
                lostIndexedDataPoints = this.indexedData.removeDataRange(serie.settings.serie.data) || lostIndexedDataPoints;
            }
            graph.groups.remove(index, 1);

            if (compactData && lostIndexedDataPoints) {
                this.indexedData.compact(true);
            }
            return lostIndexedDataPoints;
        },

        clearScaleGroups: function (graphId) {
            var
                lostIndexedDataPoints = false,
                i,
                graph = this.getSubGraphById(graphId),
                yScaleGroups = graph.groups.get(),
                length = yScaleGroups && yScaleGroups.length;

            for (i = 0; i < length; i++) {
                lostIndexedDataPoints = this.removeScaleGroup(graphId, 0, false) || lostIndexedDataPoints;
            }
            if (lostIndexedDataPoints) {
                this.indexedData.compact(true);
            }
            return lostIndexedDataPoints;
        },

        changeAxisPosition: function (graphId, yScaleGroupId, position) {
            var
                yScaleGroup = this.getGroupById(yScaleGroupId);
            this.renderer.axisPositionChanged(graphId, yScaleGroupId, position);
            return yScaleGroup.axisPosition();
        },

        showYAxisLines: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getGroupById(yScaleGroupId);
            yScaleGroup.axis.showHorizontalLines(value);
            return yScaleGroup.axis.showHorizontalLines();
        },

        showYAxisLabels: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getGroupById(yScaleGroupId);
            this.renderer.showYAxisLabels(graphId, yScaleGroupId, value);
            return yScaleGroup.axis.showLabels();
        },

        calculateYScaleLimits: function (yScaleGroup) {
            // maybe this should go in indexedData....
            if (this.indexedData.data.length) {
                var indexedData = this.indexedData,
                    beginIdx = indexedData.beginIndex,
                    endIdx = indexedData.endIndex,
                    beginTimeStamp = indexedData.data[beginIdx].timeStamp,
                    endTimeStamp = indexedData.data[endIdx].timeStamp;
                //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                yScaleGroup.setLimitsInRange(beginTimeStamp, endTimeStamp);
            } else {
                yScaleGroup.limits(null);
            }
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


        //
        //  SERIE METHODS
        //



        addSerie: function (graphId, yScaleGroupId, serie, index) {
            var
                yScaleGroup,
                item,
                hasData,
                data;

            yScaleGroup = this.getGroupById(yScaleGroupId);

            item = yScaleGroup.series.add(serie, index);
            data = serie.data;

            hasData = this.indexedData.data.length;

            this.addDataRange({data:data}/*graphId, yScaleGroupId, serie.id, data*/);

            if (hasData) {
                //calculate limits for the axis only
                this.calculateYScaleLimits(yScaleGroup);
            } else {
                //calculate the limits
                this.indexedData.setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.xAxisLimits);
            }
            this.triggerLimitChange();
            return item;
        },


        removeSerie: function (serieId) {
            var
                result,
                chain,
                serie,
                group,
                lostIndexedDataPoint;

            chain = this.getChain(serieId);
            if(!chain){
                console.log('serie not found');
                return false;
            }
            serie = chain.serie;
            group = chain.group;
            console.log('remove series:', serie);
            lostIndexedDataPoint = this.indexedData.removeDataRange(serie.settings.serie.data);
            result = serie.remove();
            this.calculateYScaleLimits(group);
            return lostIndexedDataPoint;
        },


        removeSeries: function (graphId, yScaleGroupId, index, removed) {
            var
                i,
                length = removed && removed instanceof Array ? removed.length : 1,
                yScaleGroup = this.getGroupById(yScaleGroupId),
                serie,
                lostIndexedDataPoint = false;

            if(yScaleGroup.series.list){
                yScaleGroup.series.remove(index);
            }else{
                for (i = 0; i < length; i++) {
                    serie = yScaleGroup.series(index);
                    //remove the data from indexedData
                    lostIndexedDataPoint = this.indexedData.removeDataRange(serie.settings.serie.data) || lostIndexedDataPoint;
                    //remove the serie from the group
                    yScaleGroup.series.splice(index, 1);
                }
            }

            if (lostIndexedDataPoint) {
                this.indexedData.compact(true);
            }


            this.calculateYScaleLimits(this.getGroupById(yScaleGroupId));

            return lostIndexedDataPoint;
        },



        clearSeries: function (graphId, yScaleGroupId) {
            var
                yScaleGroup = this.getGroupById(yScaleGroupId),
                series = yScaleGroup.series.get();

            this.removeSeries(graphId, yScaleGroupId, 0, series);
            yScaleGroup.render();
        },


        //
        //  LAYER METHODS
        //

/*
        addLayer: function (graphId, yScaleGroupId, serieId, layer, index) {

            var
                item,
                serie,
                length,
                yScaleGroup = this.getGroupById(yScaleGroupId),
                layerDataPointDefinitions = layer.chartType().dataPointDefinitions(),
                initialSettings = this.getSerieSectionSettings(layer);

                //console.log('ADD LAYER', layer.chartType());

            serie = this.getSerieById(serieId);
            //reset the paintable points cache
            serie._paintablePoints = undefined;

            if (index >= 0 && index < serie.sections.get().length) {
                yScaleGroup.insertSerieSection(serieId, index, initialSettings);
                serie.sections.splice(index, initialSettings);
            } else {
                yScaleGroup.addSerieSection(serieId, initialSettings);
                //serie.sections.push(initialSettings);
                index = serie.sections.get().length - 1;
            }
            item = serie.sections(index);
            this.calculateYScaleLimits(this.getGroupById(yScaleGroupId));
            return item;
        },

        clearLayers: function (graphId, yScaleGroupId, serieId) {
            var
                serie = this.getSerieById(serieId);
            serie.sections([]);
            //reset the paintable points cache
            serie._paintablePoints = undefined;
            this.calculateYScaleLimits(this.getGroupById(yScaleGroupId));
        },

        updateLayer: function (graphId, yScaleGroupId, serieId, layer, oldLayer, index) {
            this._removeLayer(graphId, yScaleGroupId, serieId, index);
            return this.addLayer(graphId, yScaleGroupId, serieId, layer, index);
        },

        _removeLayer: function (graphId, yScaleGroupId, serieId, index, layers) {

            var i,
                length = layers && layers instanceof Array ? layers.length : 1,
                yScaleGroup = this.getGroupById(yScaleGroupId),
                serie = this.getSerieById(serieId);

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

            this.calculateYScaleLimits(this.getGroupById(yScaleGroupId));
            return result;
        },

        selectLayer: function (graphId, yScaleGroupId, serieId, layerId, newValue) {
            var
                section = this.getSectionById(layerId);
            section.isSelected(newValue);
            return section.isSelected();
        },

        setInputs: function (graphId, yScaleGroupId, serieId, newInputs) {
            console.error('setInputs');
            var
                serie = this.getSerieById(serieId);
            serie.settings.serie.inputs = newInputs;
            serie.render();
        },


*/

        //
        //  MISC
        //



        setNumberFormat: function (graphId, yScaleGroupId, value) {
            var
                yScaleGroup = this.getGroupById(yScaleGroupId),
                formatter = utilities.getFormatter(value);
            yScaleGroup.axis.numberFormat(value);
            yScaleGroup.axis.formatter(formatter);
        },

        setMinMove: function (graphId, yScaleGroupId, value) {
            var yScaleGroup = this.getGroupById(yScaleGroupId);
            yScaleGroup.axis.labelRenderer.minMove(value);
            return yScaleGroup.axis.labelRenderer.minMove();
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

        setMaxViewPortSize: function (newValue) {
            if (newValue < this.minViewPortSize) {
                newValue = this.minViewPortSize;
            }
            var
                limits = this.indexedData.limits,
                actualLimits, minValueIndex, maxValueIndex;

            if (this.renderer.viewPortSize !== newValue) {
                this.renderer.viewPortSize = newValue;
                this.indexedData.setIndexes(-20, -10);
                this._lastRange = null;
                if (typeof (limits) !== 'string') {
                    maxValueIndex = limits.maxValueIndex;
                    minValueIndex = limits.maxValueIndex - newValue + 1;
                    if (minValueIndex < 0) {
                        minValueIndex = 0;
                    }
                    actualLimits = { minValueIndex: minValueIndex, maxValueIndex: maxValueIndex };
                } else {
                    actualLimits = this.indexedData.limits;
                }
                this.setLimits(actualLimits);
            }
            return newValue;
        },

        setMinViewPortSize: function (newValue) {
            this.minViewPortSize = newValue;
            if (this.renderer.viewPortSize < newValue) {
                this.renderer.viewPortSize = newValue;
            }
        },

        setOnViewPortLeftMarginChange: function (callback) {
            this.renderer.onViewPortLeftMarginChange = callback;
        },

        setOnViewPortRightMarginChange: function (callback) {
            this.renderer.onViewPortRightMarginChange = callback;
        },



        //
        //  RANGES
        //





        batchUpdateChart: function (newRange) {
            // updates the chart to a new range.
            //
            this.isBirdView = this.indexedData.endIndex - this.indexedData.beginIndex >= this.indexedData.data.length - 2;
            this.setLimitsInRange(newRange);
        },

        onRangeChanged: function (newRange, changeVisibleBars) {

            var
                lastRange = this._lastRange,
                actualRange,
                minimumNumberofVisibleBars = this.minViewPortSize,
                indexedData = this.indexedData,
                newViewPortSize,
                min = newRange.minValueIndex,
                max = newRange.maxValueIndex;

            changeVisibleBars = changeVisibleBars === undefined || changeVisibleBars;
            //try {
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

            //} catch (e) {
            //    console.error(e.stack);
            //    utilities.throwError(e);
            //}
        },

        findGlobalLimits: function (indexedData, yScaleGroups, beginIndex, endIndex) {
            var
                beginTimeStamp = indexedData.data[beginIndex].timeStamp,
                endTimeStamp = indexedData.data[endIndex].timeStamp,
                length = yScaleGroups.length,
                yScaleGroup, i;

            for (i = 0; i < length; i++) {
                yScaleGroup = yScaleGroups[i];
                //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                yScaleGroup.setLimitsInRange(beginTimeStamp, endTimeStamp);
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
                logIndexData('endIndex - 2', endIndex, 'indexedData.data.length', indexedData.data.length);
                beginTimeStamp = indexedData.data[beginIndex].timeStamp;
                endTimeStamp = indexedData.data[endIndex].timeStamp;
                for (i = 0; i < length; i++) {
                    yScaleGroup = yScaleGroups[i];
                    if (yScaleGroup.limits()) {
                        yScaleGroup.removeSeriesTimeLimits(beginTimeStamp, endTimeStamp);
                        //this.checkYScaleGroupsLimitsonRemove(yScaleGroup, beginIndex, endIndex);
                        yScaleGroup.checkLimitsOnRemove(beginIndex, endIndex);
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

                            //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp, true);
                            yScaleGroup.setLimitsInRange(beginTimeStamp, endTimeStamp, true);
                        }

                    } else {
                        //console.log('redoing the stream limits' + beginTimeStamp.toString() + ' ' + endTimeStamp.toString());
                        //we lost our limits so let's calculate the whole range including added but not removed
                        beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                        endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                        //console.log('lost YScale limits => need to recalculate all limits for : ' + beginIndex + ' ' + endIndex);
                        //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                        yScaleGroup.setLimitsInRange(beginTimeStamp, endTimeStamp);
                    }
                } else {
                    beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                    endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                    //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                    yScaleGroup.setLimitsInRange(beginTimeStamp, endTimeStamp);
                }
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

            yScaleGroups = this.getGroups();
            length = yScaleGroups && yScaleGroups.length;
            if (length) {
                // TODO
                // Qualifying the range here, but then we don't use it!!!!
                //
                //
                //
                beginIndex = newRange.minValueIndex >= 0 ? newRange.minValueIndex : 0;
                endIndex = newRange.maxValueIndex < indexedDataLength ? newRange.maxValueIndex : indexedDataLength - 1;
                logIndexData('endIndex - 4', endIndex, 'indexedData.data.length', indexedData.data.length);
                this.indexedData.setIndexes(beginIndex, endIndex);
                calculateRange = this.indexedData.getLimitCalculationData(currentRange, newRange);

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
                            series = yScaleGroup.series.get();
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








        

        











        //
        //  DATA METHODS
        //





        dataInspect: function (subgraphId, timeStamp) {
            // used by plugins
            var
                subGraph = this.getSubGraphById(subgraphId),
                search, index, axis, serieData,
                yScaleGroups, yScaleGroupsLength, i, yScaleGroup, streamsOnSpot,
                series, seriesLength, j, serie,
                result = null;

            yScaleGroups = subGraph.groups.get();
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
                            series = yScaleGroup.series.get();
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
        
        setLimits: function(newLimits, changeVisibleBars){
            this.indexedData.setLimits(newLimits, this.renderer.viewPortSize, this.getGroups());
        },

        addDataRange: function (event/*graphId, yScaleGroupId, serieId, data, analyzeLimits*/) {
            // analyzeLimits applies when a serie has its data compleely replaced
            //console.log('addDataRange', event);
            this.indexedData.addDataRange(event);

            if (event.analyzeLimits) {
                this.indexedData.setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.indexedData.limits);
                this.render();
            }
        },

        triggerLimitChange: function (newLimits) {
            // calls onLimitsChanged in app
            newLimits = newLimits || {
                limits: this.indexedData.getActualLimits(),
                total: this.indexedData.data.length-1
            };
            if (this.onLimitsChanged) {
                this.onLimitsChanged(newLimits);
            }
            this.chart.emit(this.chart.events.limits, newLimits);
        },

        addData: function(event){
            this.indexedData.addData(event);
        },




        //
        //  RENDER
        //

        resize: function () {
            this.renderer.resize();
        },
        
        render: function () {
            if(this.catchRenderErrors){
                try{
                    this.renderer.render();
                }catch(e){
                    this.chart.emit(this.chart.events.error, e);
                }
            }else{
                this.renderer.render();
            }
        },

        scroll: function () {
            this.renderer.scroll();
        },

        //hitTest: function (subgraphId, x, y) {
        //    var
        //        subGraph = this.getSubGraphById(subgraphId),
        //        target = subGraph.hitTest(x, y);
        //
        //    return this._createExternalEventObject({ target: target });
        //},

        dispose: function () {
            this.renderer.dispose();
            delete this.renderer;
            delete this.rendererSettings;
        }
    });

});
