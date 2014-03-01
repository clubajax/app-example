define([
    'dcl/dcl',
    'jquery',
    'common/Utilities',
    'common/Base',
    '../serie/SerieList',
    '../axes/YAxisRenderer',
    '../scalers/LogarithmicScaler',
    '../scalers/LinearScaler',
    'common/Rect',
    '../axes/YAxisPosition',
    'common/EventTarget'
], function (dcl, $, utilities, Base, SerieList, /*SerieRenderer, */YAxisRenderer, LogarithmicScaler, LinearScaler, rect, yAxisPosition, EventTarget) {

    // YScaleGroupRenderer is a container for a serie, and a yAxis. It is a child of a SubGraph
    // * See default settings at bottom
    //

    var USEOLD = 0;

    return dcl(Base, {
        declaredClass:'Group',

        eventTree:null,
        
        axisPosition: null,
        showLabels: null,
        showHorizontalLines: null,
        minMove: null,
        //limits: 'auto',
        numberFormat: null,
        //formatter: utilities.getFormatter(yScaleGroup.numberFormat),
        series: null,
        isAutoScale: null,

        XpreMixProperties: function(yScaleGroup){
            var
                initialSettings,
                limits = utilities.getValue(yScaleGroup.limits),
                isAutoScale = limits === 'auto';

            if (isAutoScale) {
                limits = {
                    minValue: 0,
                    maxValue: 0
                };
            }

            initialSettings = {
                id: yScaleGroup.id || utilities.uid('group'),
                axisPosition: yScaleGroup.position,
                showLabels: yScaleGroup.showLabels,
                showHorizontalLines: yScaleGroup.showHorizontalLines,
                minMove: yScaleGroup.minMove,
                limits: limits,
                numberFormat: yScaleGroup.numberFormat,
                formatter: utilities.getFormatter(yScaleGroup.numberFormat),
                series: yScaleGroup.series,
                isAutoScale: isAutoScale
            };

            return initialSettings;
        },

        constructor: function(settings, node) {

            this.domNode = node;

            this.formatter = utilities.getFormatter(settings.numberFormat);

            if (settings.limits === 'auto') {
                this.isAutoScale = true;
                settings.limits = this.limits = {
                    minValue: 0,
                    maxValue: 0
                };
            }


            this.axisPosition = settings.axisPosition = settings.position || 'right';
            settings.formatter = this.formatter;


            settings.scaler = settings.scalingType === 'semilog' ? new LogarithmicScaler() : new LinearScaler();


           var
                self = this,
                iRect = settings.rect;

            this.id = settings.id || utilities.uid('ygroup');
            settings.id = this.id;

            console.log('Group', this.id);
            window[this.id] = this;

            this._serieRect = rect();
            this.settings = settings;

            this.eventTree.setSource('group', this);

            this.domNode = utilities.dom('div', {
                css:'YScaleGroupRenderer',
                style:{
                    position:'absolute',
                    top:0,
                    left:0
                }
            }, node);

            //if(USEOLD){
                this.seriesMap = {};
            //}
            this.limitsMaxWidth = 0;
            this._isPendingAxisLabelRendering = false;
            this._isPendingAxisIndicationRendering = false;
            this._isPendingAxisIndicationCollection = false;
            this._isPendingAxisLabelCalculation = false;


            this.axisPosition = utilities.settingProperty(settings, 'axisPosition', function () {
                self._setAxisPosition();
            });

            this.limits = utilities.settingProperty(settings, 'limits', function (value) {
                //console.trace('');
                //console.log('LIMITS', value);
                self._setScalerValueLimits();
                self._computeLimitMaxWidth();
            });

            //console.log('GET LIMITS', this.limits());

            if (settings.limits === 'auto') {
                this.limits({
                    minValue: 0,
                    maxValue: 0
                });
            }

            this.numberFormat = utilities.settingProperty(settings, 'numberFormat', function (numberFormat) {
                if (self.axis) {
                    self.axis.numberFormat(numberFormat);
                    self._isPendingAxisLabelRendering = true;
                }
            });

            this.formatter = utilities.settingProperty(settings, 'formatter', function (formatter) {
                if (self.axis && self.axis.indicationRenderer) {
                    self.axis.indicationRenderer.formatter(formatter);
                    self._isPendingAxisIndicationRendering = true;
                }
            });

            this.axisWidth = utilities.settingProperty(settings, 'axisWidth',function (newAxisWidth, legacyAxisWidth) {
                self._resize();
            });

            this.rect = utilities.settingProperty(settings, 'rect', function () {
                self._resize();
            });

            this.scaler = utilities.settingProperty(settings, 'scaler', function (newScaler, legacyScaler) {
                if (legacyScaler) {
                    legacyScaler.dispose();
                }
                self._setScaler();
                self._setScalerValueLimits(newScaler);
                self._computeLimitMaxWidth();
                self._setScalerPositionLimits(newScaler);
            });

            this.showHorizontalLines = utilities.settingProperty(settings, 'showHorizontalLines', function (showHorizontalLines) {
                self.axis.showHorizontalLines(showHorizontalLines);
                self._isPendingAxisLabelRendering = true;
            });

            this.showLabels = utilities.settingProperty(settings, 'showLabels', function (showLabels) {
                self.axis.showLabels(showLabels);
                self._isPendingAxisLabelRendering = true;
                if (showLabels) {
                    self._isPendingAxisIndicationRendering = true;
                }
                var limits = settings.limits;
                self.limitsMaxWidth = self._computeLimitMaxLengthInPx(self.axis, settings.numberFormat, limits.minValue, limits.maxValue);
            });

            this._labelsForIndication = [];
            this._axisRect = null;
            this.axis = null;
            this._setScalerValueLimits();

            if (settings.axisPosition === yAxisPosition.left || settings.axisPosition === yAxisPosition.right) {
                this._createAxis(rect());
                this._computeLimitMaxWidth();
            }

            this.series = this.list = new SerieList({
                eventTree: this.eventTree,
                scaler: settings.scaler,
                rect: this._serieRect,
                indexedData: settings.indexedData,
                painterFactory: settings.painterFactory,
                theme:settings.theme
            }, this.domNode);

            this.eventTree.on(this.eventTree.events.addSerie, this.onAddSeries, this);
            this.eventTree.on(this.eventTree.events.removeSerie, this.onRemoveSeries, this);


            this.eventTree.on(this.eventTree.events.chartType, function(event){
                this.renderIndication(event.serie.id);
            }, this);

            this.series.add(settings.series);


            if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                this._setAxisPosition();
                this._resize();
            }
        },

        onRemoveSeries: function (serieId) {
            console.log('REM SERIES');
            if(!serieId){
                return;
            }
            var
                i,
                serieRepository = this.series.get(),
                map = this.seriesMap,
                minValueIndex = null,
                maxValueIndex = null,
                labelLimits,
                numberOfLabelsToDelete,
                labelsForIndication = this._labelsForIndication;

            if (this.axis) {
                minValueIndex = map[serieId].labelLimits.minValueIndex;
                maxValueIndex = map[serieId].labelLimits.maxValueIndex;
            }

            if (minValueIndex !== null) {
                this._isPendingAxisIndicationRendering = true;
                numberOfLabelsToDelete = 1;//maxValueIndex - minValueIndex;
                labelsForIndication.splice(minValueIndex, numberOfLabelsToDelete);
                for (i = 0; i < serieRepository.length; i++) {
                    labelLimits = map[serieRepository[i].id].labelLimits;
                    labelLimits.minValueIndex -= numberOfLabelsToDelete;
                    labelLimits.maxValueIndex -= numberOfLabelsToDelete;
                }
            }

            if (!length && this.axis) {
                this._isPendingAxisLabelCalculation = true;
                this._isPendingAxisLabelRendering = true;
            }

            delete map[serieId];

            this.eventTree.emit(this.eventTree.events.updateGroup, {group:this});
        },

        onAddSeries: function(event) {
            var serie = event.serie;
            this.seriesMap[serie.id] = {
                object: serie,
                labelLimits: {
                    minValueIndex: null,
                    maxValueIndex: null
                }
            };

            this._isPendingAxisIndicationCollection = !!this.axis;
        },

        dimensions: function (iRect, axisWidth, headerHeight) {
            this.settings.rect = iRect;
            this.settings.axisWidth = axisWidth;
            this.settings.headerHeight = headerHeight;
            this._resize();
        },

        changeRectAndHeaderHeight: function (iRect, headerHeight) {
            this.settings.rect = iRect;
            this.settings.headerHeight = headerHeight;
            this._resize();
        },

        _setScalerPositionLimits: function (scaler) {

            var
                settings = this.settings,
                positionLimits;

            scaler = scaler || settings.scaler;

            if (settings.rect.bottom >= settings.headerHeight) {

                positionLimits = scaler.positionLimits();

                if (!positionLimits || positionLimits.minValue !== settings.headerHeight || positionLimits.maxValue !== settings.rect.bottom) {
                    scaler.positionLimits({
                        maxValue: settings.rect.bottom,
                        minValue: settings.headerHeight
                    });

                    if (this.axis) {
                        this._isPendingAxisIndicationRendering = true;
                        this._isPendingAxisLabelCalculation = true;
                    }
                }
            } else {
                scaler.positionLimits({
                    minValue: 0,
                    maxValue: 0
                });
            }
        },

        _setScalerValueLimits: function (scaler) {
            var
                settings = this.settings,
                limits = settings.limits;
            scaler = scaler || settings.scaler;
            scaler.valueLimits(limits);
        },

        _computeLimitMaxWidth:function() {
            var
                settings = this.settings,
                limits = settings.limits,
                isAxis = !!this.axis;

            if (isAxis && limits) {
                this.limitsMaxWidth = this._computeLimitMaxLengthInPx(this.axis, settings.numberFormat, limits.minValue, limits.maxValue);
            } else if (isAxis) {
                this.limitsMaxWidth = this.axis.computeRecommendedWidth('');
            } else {
                this.limitsMaxWidth = 0;
            }

            this._isPendingAxisIndicationRendering = isAxis;
            this._isPendingAxisLabelCalculation = isAxis;
        },

        _computeLimitMaxLengthInPx: function (axis, numberFormat, minValue, maxValue) {
            var minValueFormatted = utilities.priceFormatterForMeasure(minValue, numberFormat),
                maxValueFormatted = utilities.priceFormatterForMeasure(maxValue, numberFormat);

            return axis.computeRecommendedWidth(minValueFormatted.length > maxValueFormatted.length ? minValueFormatted : maxValueFormatted);
        },

        _setScaler: function() {
            var
                scaler = this.scaler(),
                serieRenderers = this.series(),
                length = serieRenderers.length,
                serieRenderer;

            if (this.axis) {
                this.axis.scaler(scaler);
            }

            for (serieRenderer = serieRenderers[0]; length; serieRenderer = serieRenderers[--length]) {
                serieRenderer.scaler(scaler);
            }
        },

        _setAxisPosition:function() {
            var
                settings = this.settings,
                iRect = settings.rect;

            if (settings.axisPosition === yAxisPosition.left || settings.axisPosition === yAxisPosition.right) {
                if (this.axis) {
                    this.axis.axisPosition(settings.axisPosition);

                } else {
                    this._createAxis(rect(0, 0, iRect.bottom - iRect.top, iRect.right - iRect.left));
                    this._isPendingAxisIndicationCollection = true;
                }

            } else {

                this._isPendingAxisIndicationCollection = false;
                if (this.axis) {
                    this._disposeAxis(this);
                }
            }
            this._computeLimitMaxWidth(this);
        },

        _createAxis: function (axisRect) {
            var
                settings = this.settings;

            this._labelsForIndication.length = 0;
            this._axisRect = axisRect;

            this.axis =
                new YAxisRenderer(
                    this.domNode, {
                        axisPosition: settings.axisPosition,
                        rect: this._axisRect,
                        scaler: settings.scaler,
                        axisWidth: settings.axisWidth,
                        showLabels: settings.showLabels,
                        showHorizontalLines: settings.showHorizontalLines,
                        labelAxisDistance: settings.labelAxisDistance,
                        labelBorderDistance: settings.labelBorderDistance,
                        theme: settings.theme,
                        minMove: settings.minMove,
                        numberFormat: settings.numberFormat,
                        formatter: settings.formatter,
                        indicationLabels: this._labelsForIndication
                    }
                );

            this._isPendingAxisIndicationCollection = true;
        },

        _disposeAxis:function () {
            this._axisRect = null;
            this._labelsForIndication.length = 0;
            this.axis.dispose();
            this.axis = null;
        },



        hitTest: function (x, y) {
            var
                series = this.series.get(),
                length = series.length,
                target;

            do {
                target = series[--length].hitTest(x, y);

                if (target) {

                    if (target.targetParent.targetParent) {
                        target.targetParent.targetParent.targetParent = new EventTarget(this);
                    } else {
                        target.targetParent.targetParent = new EventTarget(this);
                    }

                    return target;
                }
            } while (length);

            return null;
        },

        addSerieSection: function(serieId, sectionSettings) {
            var
                serieMap = this.seriesMap[serieId];

            this._isPendingAxisIndicationCollection = true;
            return serieMap.object.sections.push(sectionSettings);
        },

        insertSerieSection: function(serieId, index, sectionSettings) {
            var
                serieMap = this.seriesMap[serieId],
                sections = serieMap.object.sections;

            this._isPendingAxisIndicationCollection = true;
            sections.splice(index, 0, sectionSettings);
            return sections(index);
        },

        removeSerieSection: function (serieId, index) {
            var
                serieMap = this.seriesMap[serieId];

            this._isPendingAxisIndicationCollection = true;
            return serieMap.object.sections.splice(index, 1);
        },

        updateSerieSection: function(serieId, index, sectionSettings) {
            var
                serieMap = this.seriesMap[serieId],
                sections = serieMap.object.sections;

            this._isPendingAxisIndicationCollection = true;
            sections.splice(index, 1, sectionSettings);
            return sections(index);
        },

        changeSerieSectionChartType: function(serieId, sectionId, chartTypeName, chartTypeStyle, dataPointDefinitions) {
            var
                serieMap = this.seriesMap[serieId],
                section = serieMap.object.sectionsMap[sectionId].object;

            section.changeChart(chartTypeName, chartTypeStyle, dataPointDefinitions);
            this._isPendingAxisIndicationCollection = true;
        },

        renderIndex: function (serieId) {
            var
                index = 0, // total guess. Do not know what it should be.
                serieRenderer = this._seriesMap[serieId].object.serieRenderer;

            serieRenderer.renderIndex(index);
            this.renderIndication(serieId, index);

        },

        _resize: function() {
            var
                parentSize = utilities.box(this.domNode.parentNode),
                height = parentSize.height,
                width = parentSize.width,
                settings = this.settings,
                iRect = settings.rect,
                axisRect = this._axisRect,
                serieRect = this._serieRect,
                showHorizontalLines = settings.showHorizontalLines,
                series = this.series.get(),
                length = series.length,
                axisWidth = settings.axisWidth,
                serie;

                utilities.style(this.domNode, {
                    width:width,
                    height:height
                });

            if (settings.axisPosition === yAxisPosition.left) {

                serieRect.left = axisWidth;

                this._isPendingAxisLabelRendering |= serieRect.right !== iRect.right + axisWidth;

                serieRect.right = iRect.right;
                serieRect.top = settings.headerHeight;

                axisRect.top = 0;
                axisRect.left = 0;
                axisRect.bottom = iRect.bottom;

                if (showHorizontalLines) {
                    this._isPendingAxisLabelRendering |= axisRect.right !== iRect.right;
                    axisRect.right = iRect.right;
                } else {
                    this._isPendingAxisLabelRendering |= axisRect.right !== axisWidth;
                    axisRect.right = axisWidth;
                }

                if (this._isPendingAxisLabelRendering) {
                    this.axis.changeRectAndAxisWidthAndHorizontalLinesVisibility(axisRect, settings.axisWidth, settings.showHorizontalLines);
                    this._isPendingAxisIndicationRendering = !!this.axis.indicationRenderer;
                }

            } else if (settings.axisPosition === yAxisPosition.right) {

                serieRect.left = iRect.left;
                this._isPendingAxisLabelRendering |= serieRect.right !== iRect.right - axisWidth;

                serieRect.right = iRect.right - axisWidth;
                serieRect.top = settings.headerHeight;
                axisRect.top = 0;

                if (showHorizontalLines) {
                    this._isPendingAxisLabelRendering |= axisRect.left !== iRect.left;
                    axisRect.left = iRect.left;
                } else {

                    this._isPendingAxisLabelRendering |= axisRect.left !== serieRect.right;
                    axisRect.left = serieRect.right;
                }

                axisRect.bottom = iRect.bottom;
                this._isPendingAxisLabelRendering |= axisRect.right !== iRect.right;
                axisRect.right = iRect.right;

                if (this._isPendingAxisLabelRendering) {
                    this.axis.changeRectAndAxisWidthAndHorizontalLinesVisibility(axisRect, settings.axisWidth, settings.showHorizontalLines);
                    this._isPendingAxisIndicationRendering = !!this.axis.indicationRenderer;
                }

            } else {
                serieRect.left = 0;
                serieRect.right = iRect.right - iRect.left;
                serieRect.top = settings.headerHeight;
            }

            serieRect.bottom = iRect.bottom;
            this._setScalerPositionLimits();

            if(USEOLD){
                for (serie = series[0]; length; serie = series[--length]) {
                    serie.rect(serieRect);
                }
            }else{
                this.series.dimensions(serieRect);
                this.series.resize();
            }
        },

        render: function (serieId) {
            if (serieId) {
                this._seriesMap[serieId].serieRenderer.render();
            } else {

                var
                    serieRenderers = this.series.get(),
                    seriesMap = this.seriesMap,
                    length = serieRenderers.length, i,
                    serieRenderer, serieMap, labelsForIndication, serieLabels,
                    labelMinValueIndex, labelMaxValueIndex;

                if (this.axis) {

                    if (this._isPendingAxisLabelCalculation) {
                        this.axis.labelRenderer.preRender();
                        this._isPendingAxisLabelCalculation = false;
                        this._isPendingAxisLabelRendering = true;
                    }

                    if (this._isPendingAxisLabelRendering) {
                        this.axis.render();
                    }

                    if (this.axis.indicationRenderer) {

                        labelsForIndication = this._labelsForIndication;

                        if (this._isPendingAxisIndicationCollection) {

                            this._isPendingAxisIndicationCollection = false;

                            labelsForIndication.length = 0;
                            labelMinValueIndex = 0;

                            for (i = 0; i < length; i++) {

                                serieRenderer = serieRenderers[i];
                                serieRenderer.render();
                                serieMap = seriesMap[serieRenderer.id];
                                serieLabels = serieRenderer.getLabelsForIndication();
                                if (serieLabels) {
                                    labelMaxValueIndex = labelMinValueIndex + serieLabels.length - 1;
                                    serieMap.labelLimits.minValueIndex = labelMinValueIndex;
                                    serieMap.labelLimits.maxValueIndex = labelMaxValueIndex;
                                    labelsForIndication.push.apply(labelsForIndication, serieLabels);
                                    labelMinValueIndex = labelMaxValueIndex + 1;
                                } else {

                                    serieMap.labelLimits.minValueIndex = null;
                                    serieMap.labelLimits.maxValueIndex = null;
                                    this._isPendingAxisIndicationCollection = true;

                                }
                            }

                            this.axis.indicationRenderer.labels(labelsForIndication);
                            this._isPendingAxisIndicationRendering = true;

                        } else {
                            for (serieRenderer = serieRenderers[0]; length; serieRenderer = serieRenderers[--length]) {
                                serieRenderer.render();
                            }
                        }

                        if (this._isPendingAxisIndicationRendering) {
                            this.axis.indicationRenderer.render();
                            this._isPendingAxisIndicationRendering = false;
                        }

                    } else {
                        for (serieRenderer = serieRenderers[0]; length; serieRenderer = serieRenderers[--length]) {
                            serieRenderer.render();
                        }
                    }

                } else {
                    for (serieRenderer = serieRenderers[0]; length; serieRenderer = serieRenderers[--length]) {
                        serieRenderer.render();
                    }
                }
            }
        },

        renderIndication: function (serieId) {
            var
                serieMap = this.seriesMap[serieId],
                serieRenderer = serieMap.object,
                labelLimits = serieMap.labelLimits,
                labelsForIndication = this._labelsForIndication,
                serieLabels = serieRenderer.getLabelsForIndication(),
                maxValueIndex = labelLimits.maxValueIndex,
                minValueIndex = labelLimits.minValueIndex,
                i = 0, length, series;

            if (this.axis.indicationRenderer){
                if (serieLabels) {
                    if (minValueIndex !== null) {
                        while (minValueIndex <= maxValueIndex) {
                            labelsForIndication[minValueIndex] = serieLabels[i];
                            minValueIndex++;
                            i++;
                        }

                    } else {

                        //series = yScaleGroup.series();
                        //console.log('USING UNTESTED CODE');
                        series = serieMap.object;
                        length = series.length;

                        while (i < length) {
                            if (serieRenderer.id === series[i++].id) {
                                break;
                            }
                        }

                        minValueIndex = i ? serieMap[series[i - 1].id].labelLimits.maxValueIndex + 1 : 0;

                        labelLimits.maxValueIndex = minValueIndex + serieLabels.length - 1;
                        labelLimits.minValueIndex = minValueIndex;

                        serieLabels.unshift(minValueIndex, 0);

                        labelsForIndication.splice.apply(labelsForIndication, serieLabels);

                        while (++i < length) {
                            labelLimits = serieMap[series[i].id].labelLimits;

                            labelLimits.minValueIndex += serieLabels.length;
                            labelLimits.maxValueIndex += serieLabels.length;
                        }

                    }

                } else {

                    if (minValueIndex !== null) {

                        labelsForIndication.splice(minValueIndex, maxValueIndex - minValueIndex + 1);

                        labelLimits.maxValueIndex = null;
                        labelLimits.minValueIndex = null;
                    }

                    this._isPendingAxisIndicationCollection = true;
                }

                this.axis.indicationRenderer.labels(labelsForIndication);

                this.axis.indicationRenderer.render();

                this._isPendingAxisIndicationRendering = false;
            }

        },

        dataInspect: function (index, serieIndex) {

            var
                data = this.series.get(serieIndex).dataInspect(index),
                layers = data.layers,
                i2Length,
                length = layers.length,
                layer,
                formatter = this.formatter,
                value;

            for (layer = layers[0]; length; layer = layers[--length]) {
                i2Length = layer.length;
                for (value = layer[0]; i2Length; value = layer[--i2Length]) {
                    value.formattedValue = value.formattedValue || formatter(value.value);
                }
            }

            return data;
        },

        calculateLimits: function (indexedData) {
            if (indexedData.data.length) {
                var beginIdx = indexedData.beginIndex,
                    endIdx = indexedData.endIndex,
                    beginTimeStamp = indexedData.data[beginIdx].timeStamp,
                    endTimeStamp = indexedData.data[endIdx].timeStamp;
                //this.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                this.setLimitsInRange(beginTimeStamp, endTimeStamp);
            } else {
                this.limits(null);
            }
        },

        checkLimitsOnRemove: function (beginIndex, endIndex) {
            if (this.isAutoScale) {
                var limits = this.limits();
                if ((limits.minValueIndex >= beginIndex && limits.minValueIndex <= endIndex) ||
                    (limits.maxValueIndex >= beginIndex && limits.maxValueIndex <= endIndex)) {
                    this.limits(null);
                }
            }
        },

        setLimitsInRange: function (beginTimeStamp, endTimeStamp, combine) {
            var series, serieLength, i, serie, limits, serieLimits,
                beginIdx, endIdx, hasLimits = false;

            series = this.series.get();
            serieLength = series.length;
            for (i = 0; i < serieLength; i++) {
                serie = series[i];
                serie.setTimeLimitsInRange(beginTimeStamp, endTimeStamp, combine);
            }
            if (this.isAutoScale) {
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
                        hasLimits = serie.processValueLimits(beginIdx, endIdx, limits) || hasLimits;
                    }
                }
                if (hasLimits) {
                    this.limits(limits);
                } else {
                    this.limits(null);
                }
            }
        },

        removeSeriesTimeLimits: function (beginTimeStamp, endTimeStamp) {
            //Note: the timestamps are the indexedData timestamps not the stream's
            var series, serie, i, serieLength;
            series = this.series.get();
            serieLength = series.length;
            for (i = 0; i < serieLength; i++) {
                serie = series[i];
                serie.removeTimeLimits(beginTimeStamp, endTimeStamp);
            }
        },

        dispose: function () {
            this.axisPosition = null;
            this.axisWidth = null;
            this.showLabels = null;
            this.limits = null;
            this.rect = null;
            this.scaleType = null;
            this.minMove = null;
            this._serieRect = null;
            this._labelsForIndication.length = 0;
            this.series(null);

            this.series = null;
            this._seriesMap = null;

            if (this.axis) {
                this._disposeAxis(this);
            }

            this.settings = null;
            this.settings = null;
        }
    });
});
