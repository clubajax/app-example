define([
    'dcl/dcl',
    'jquery',
    'common/Utilities',
    '../serie/SerieRenderer',
    '../axes/YAxisRenderer',
    'common/Rect',
    '../axes/YAxisPosition',
    'common/EventTarget'
], function (dcl, $, utilities, SerieRenderer, YAxisRenderer, rect, yAxisPosition, EventTarget) {

    // YScaleGroupRenderer is a comtainer for a serie, and a yAxis. It is a child of a SubGraph
    // * See default settings at bottom
    // 
    return dcl(null, {
        delcaredClass:'YScaleGroupRenderer',
        constructor: function($parent, settings) {


            $parent = $($parent);

            
            var
                self = this,
                iRect = settings.rect;

            this.id = settings.id;

            this._serieRect = rect();
            this.settings = settings;
            this.$parent = $parent;

            this._$domElement = $("<div class='YScaleGroupRenderer' style='position:absolute; top:0px; left:0px;'></div>");
            $parent.append(this._$domElement);

            this.seriesMap = {};
            this.limitsMaxWidth = 0;
            this._isPendingAxisLabelRendering = false;
            this._isPendingAxisIndicationRendering = false;
            this._isPendingAxisIndicationCollection = false;
            this._isPendingAxisLabelCalculation = false;


            this.axisPosition = utilities.settingProperty(settings, 'axisPosition',
                function () {
                    self._setAxisPosition();
                }
            );

            this.limits = utilities.settingProperty(settings, 'limits',
                function () {
                    self._setScalerValueLimits();
                    self._computeLimitMaxWidth();
                }
            );

            this.numberFormat = utilities.settingProperty(settings, 'numberFormat',
                function (numberFormat) {
                    if (self.axis) {
                        self.axis.numberFormat(numberFormat);
                        self._isPendingAxisLabelRendering = true;
                    }
                }
            );

            this.formatter = utilities.settingProperty(settings, 'formatter',
                function (formatter) {
                    if (self.axis && self.axis.indicationRenderer) {
                        self.axis.indicationRenderer.formatter(formatter);
                        self._isPendingAxisIndicationRendering = true;
                    }
                }
            );

            this.axisWidth = utilities.settingProperty(settings, 'axisWidth',
                function (newAxisWidth, legacyAxisWidth) {
                    self._resize();
                }
            );

            this.rect = utilities.settingProperty(settings, 'rect',
                function () {
                    self._resize();
                }
            );

            this.scaler = utilities.settingProperty(settings, 'scaler',
                function (newScaler, legacyScaler) {
                    if (legacyScaler) {
                        legacyScaler.dispose();
                    }
                    self._setScaler();
                    self._setScalerValueLimits(newScaler);
                    self._computeLimitMaxWidth();
                    self._setScalerPositionLimits(newScaler);
                }
            );

            this.showHorizontalLines = utilities.settingProperty(settings, 'showHorizontalLines',
                function (showHorizontalLines) {
                    self.axis.showHorizontalLines(showHorizontalLines);
                    self._isPendingAxisLabelRendering = true;
                }
            );

            this.showLabels = utilities.settingProperty(settings, 'showLabels',
                function (showLabels) {
                    self.axis.showLabels(showLabels);
                    self._isPendingAxisLabelRendering = true;
                    if (showLabels) {
                        self._isPendingAxisIndicationRendering = true;
                    }
                    var limits = settings.limits;
                    self.limitsMaxWidth = self._computeLimitMaxLengthInPx(self.axis, settings.numberFormat, limits.minValue, limits.maxValue);
                }
            );

            this._labelsForIndication = [];
            this._axisRect = null;
            this.axis = null;
            this._setScalerValueLimits();

            if (settings.axisPosition === yAxisPosition.left || settings.axisPosition === yAxisPosition.right) {
                this._createAxis(rect());
                this._computeLimitMaxWidth();
            }

            this.series = utilities.settingArrayPropertyProxy(
                settings.series,
                function (index, addedObject) {

                    self.seriesMap[addedObject.id] = {
                        object: addedObject,
                        labelLimits: {
                            minValueIndex: null,
                            maxValueIndex: null
                        }
                    };

                    self._isPendingAxisIndicationCollection = !!self.axis;

                    settings.serieZOrder += settings.serieZOrderSlotSize;

                },
                function (index, newObject, formerObject) {

                    self._removeSeries(index, [formerObject]);

                    self._addSerie(index, newObject);
                },
                function (index, removedObjects) {
                    self._removeSeries(index, removedObjects);
                },
                function (removedObjects) {
                    var
                        object,
                        length = removedObjects.length,
                        map = self.seriesMap;

                    for (object = removedObjects[0]; length; object = removedObjects[--length]) {
                        delete map[object.id];
                        object.dispose();
                    }

                    self._isPendingAxisIndicationCollection = !!self.axis;

                },
                function (objectSetting) {

                    return new SerieRenderer(
                        self._$domElement, {
                            id: objectSetting.id,
                            scaler: settings.scaler,
                            rect: self._serieRect,
                            serie: objectSetting,
                            indexedData: settings.indexedData,
                            painterFactory: settings.painterFactory,
                            zOrder: settings.serieZOrder,
                            maxSelectionZOrder: settings.maxSelectionZOrder,
                            isSectionsCollectionHasChangedCallback: function () {
                                self._isPendingAxisIndicationCollection = !!self.axis;
                            },
                            isSelectionChangeCallback: function (eventTarget, isSelection) {
                                eventTarget.targetParent.targetParent = new EventTarget(self);
                                settings.isSelectionChangeCallback(eventTarget, isSelection);
                            },
                            theme:settings.theme
                        }
                    );
                });


            if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                this._setAxisPosition();
                this._resize();
            }
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

        _removeSeries: function (index, series) {
            if(!series){
                return;
            }
            var
                serieRepository = this.series(),
                map = this.seriesMap,
                minValueIndex = null,
                maxValueIndex = null,
                labelLimits, numberOfLabelsToDelete,
                length = series.length,
                removedObject, i,
                labelsForIndication = this._labelsForIndication;

            if (this.axis) {
                minValueIndex = map[series[0].id].labelLimits.minValueIndex;
                maxValueIndex = map[series[length - 1].id].labelLimits.maxValueIndex;
            }

            for (i = 0; i < length; i++) {
                removedObject = series[i];
                delete map[removedObject.id];
                removedObject.dispose();
            }

            if (minValueIndex !== null) {
                this._isPendingAxisIndicationRendering = true;
                numberOfLabelsToDelete = maxValueIndex - minValueIndex;
                labelsForIndication.splice(minValueIndex, numberOfLabelsToDelete);
                length = serieRepository.length;
                for (i += index; i < length; i++) {
                    labelLimits = map[serieRepository[i].id].labelLimits;
                    labelLimits.minValueIndex -= numberOfLabelsToDelete;
                    labelLimits.maxValueIndex -= numberOfLabelsToDelete;
                }
            }

            if (!length && this.axis) {
                this._isPendingAxisLabelCalculation = true;
                this._isPendingAxisLabelRendering = true;
            }
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
                    this._$domElement, {
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
                        indicationLabels: this._labelsForIndication,
                        horizontalLinesZOrder: settings.horizontalLinesZOrder,
                        axisZOrder: settings.axisZOrder
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

        _resize: function() {

            var
                $domElement = this._$domElement,
                $parent = this.$parent,
                height = $parent.height(),
                width = $parent.width(),
                settings = this.settings,
                iRect = settings.rect,
                axisRect = this._axisRect,
                serieRect = this._serieRect,
                showHorizontalLines = settings.showHorizontalLines,
                series = this.series(),
                length = series.length,
                axisWidth = settings.axisWidth,
                serie;

                $domElement.height(height);
                $domElement.width(width);

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

            for (serie = series[0]; length; serie = series[--length]) {
                serie.rect(serieRect);
            }
        },

        hitTest: function (x, y) {
            var
                series = this.series(),
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

        render: function (serieId) {

            if (serieId) {
                this._seriesMap[serieId].serieRenderer.render();
            } else {

                var
                    serieRenderers = this.series(),
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
                data = this.series()[serieIndex].dataInspect(index),
                layers = data.layers,
                i2Length,
                length = layers.length,
                layer,
                formatter = this.formatter(),
                value;

            for (layer = layers[0]; length; layer = layers[--length]) {
                i2Length = layer.length;
                for (value = layer[0]; i2Length; value = layer[--i2Length]) {
                    value.formattedValue = value.formattedValue || formatter(value.value);
                }
            }

            return data;
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
            this._$domElement.off();
            this._$domElement.remove();
            this._$domElement = null;
            this.settings = null;
        }
    });
});

 //<summary>
//  settings:{
//      style:{
//          labels: {
//              font: 'normal 11px AramidBook',
//              color: 'rgba(235, 235, 235, 1)'
//          },
//          lines:{
//              color: 'rgba(62, 65, 70, 1)',
//              width: 1
//          }
//          indication:{
//              font: 'normal 11px AramidBook',
//              color: 'rgba(0, 0, 0', 1)
//          },
//      },
//        axisPosition: @enum,//['Right', 'Left', 'None'],
//        axisWidth: @number || undefined,
//        headerHeight : @number || undefined,
//        showLabels : @boolean,
//        showHorizontalLines: @boolean,
//        limits: @object {
//                minValue: null,
//                maxValue: null
//        },
//        rect: @object {
//            top: @number,
//            left: @number,
//            bottom: @number,
//            right: @number
//        },
//        scaler:  @object {
//              positionLimits: {
//                  maxValue: @number
//                  minValue: @number
//              },
//              valueLimits: {
//                  maxValue: @number
//                  minValue: @number
//              },
//              calculate : function(value)
//        },
//        minMove: @number,
//        formatter: @object {
//              format : function(value)
//        },
//        numberFormat: @number,
//        indexedData: @Array, //reference
//        painterFactory: @object, //reference
//        series: [<serie>],
//        headerZOrder: @number,
//        minZOrder: @number,
//        maxZOrder: @number
//  }
//<summary>
