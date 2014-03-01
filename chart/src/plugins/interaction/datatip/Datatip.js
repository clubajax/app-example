define([
    'dcl/dcl',
    'jquery',
    'plugins/interaction/datatip/DataTipRenderer',
    'common/utilities'
], function (dcl, $, DataTipRenderer, utilities) {

     var defaultStyleSettings = {
            domElement: {
                cssText: undefined,
                cssClass: 'ui-dt-host'
            },
            table: {
                cssText: undefined,
                cssClass: 'ui-dt-table'
            },
            fields: {
                cssText: undefined,
                cssClass: 'ui-dt-field'
            },
            symbols: {
                cssText: undefined,
                cssClass: 'ui-dt-symbol'
            },
            crosshairValues: {
                cssText: undefined,
                cssClass: 'ui-dt-crosshair'
            },
            data: {
                cssText: undefined,
                cssClass: 'ui-dt-data'
            }
        },
        defaultTimeSettigns = {
            time: {
                cssText: undefined,
                cssClass: 'ui-dt-time'
            }
        };

    return dcl(null, {
        declaredClass:'DataTip',
        pluginName:'datatip',
        constructor: function(settings){
            this.settings = settings;
            this.settings.delay = this.settings.delay || 500;
            this._plugin = this.settings.alwaysEnabled;
            this.settings.forwardEvent = this.settings.forwardEvent || this.settings.forwardEvent === undefined;
        },
        onEventCallback: function (eventType, eventObject) {
            if (this[eventType]) {
                return this[eventType](eventObject);
            } else {
                return true;
            }
        },
        createDatatipSettings: function (eventObject) {
            var
                settings = this.settings.onRetrieveSettings(eventObject.pointers[0].graphIndex),
                data = [],
                i,
                ilenght = settings.data.length,
                j, jlength, symbolData;

            this._dataTemplate = settings.data;
            this._settings = settings;

            for (i = 0; i < ilenght; i++) {
                symbolData = settings.data[i];
                data[i] = [];
                jlength = symbolData.length;
                for (j = 0; j < jlength; j++) {
                    data[i][j] = { value: '' };
                }
            }

            settings.data = data;

            return settings;
        },

        createRenderer: function ($parent, eventObject) {
            var
                settings = this.createDatatipSettings(eventObject),
                $chartElement,
                chart = eventObject.chart,
                onOver,
                self = this,
                renderer = new DataTipRenderer(settings);

            $parent.append(renderer.domElement);
            this._plugin = renderer;
            this._timeFormatter = settings.time.formatter;
            $chartElement = eventObject.chart.$chartElement();
            onOver = function(e) {
                var
                    chartOffset = $chartElement.offset(),
                    targetOffset = $(e.target).offset(),
                    fakeEvent, x, y;

                x = targetOffset.left - chartOffset.left + e.offsetX;
                y = targetOffset.top - chartOffset.top + e.offsetY;

                fakeEvent = chart.eventInspect(x, y);
                e.chart = fakeEvent.chart;
                fakeEvent = $.extend(e, { pointers: [fakeEvent] });

                self.moveGesture(fakeEvent);

                chart.engine.renderer.triggerGesture('move', fakeEvent);

            };

            $(renderer.domElement).children().on('mouseover', onOver);
            $(renderer.domElement).children().on('touchmove', onOver);

            return renderer;
        },

        disposeRenderer: function () {
            if (this._plugin && this._plugin.$domElement) {
                this._plugin.$domElement.children().off();
                this._plugin.$domElement.off();
                this._plugin.$domElement.remove();
                this._plugin.dispose();
                delete this._plugin;
                delete this._dataTemplate;
                delete this._graphIndex;
            }
        },

        createSerieKey: function (graphIndex, axisIndex, serieIndex) {
            return graphIndex + "||" + axisIndex + "||" + serieIndex;
        },

        createSerieDataInspect: function (map, graphIndex, axisIndex, serieIndex, serie) {
            var
                key = this.createSerieKey(graphIndex, axisIndex, serieIndex),
                layers = serie && serie.layers,
                i, j,
                dataObject = {},
                layerkey,
                layer,
                layerPointLength,
                length = layers && layers.length;

            for (i = 0; i < length; i++) {
                layer = layers[i];
                layerPointLength = layer.length;
                for (j = 0; j < layerPointLength; j++) {
                    layerkey = layer[j].key;
                    if (dataObject[layerkey] === undefined) {
                        dataObject[layerkey] = layer[j];
                    }
                }
            }
            length = serie.values.length;
            for (i = 0; i < length; i++) {
                if (!dataObject[i]) {
                    dataObject[i] = serie.values[i];
                }
            }
            map[key] = dataObject;
            return dataObject;
        },

        createDataInspectMap: function (graphIndex, dataInspect) {
            var
                i,
                axes = dataInspect.axes,
                axesLength,
                series,
                j,
                seriesLength,
                result = {};

            axesLength = axes.length;
            for (i = 0; i < axesLength; i++) {
                series = axes[i].series;
                seriesLength = series.length;
                for (j = 0; j < seriesLength; j++) {
                    if (series[j].layers) {
                        this.createSerieDataInspect(result, graphIndex, i, j, series[j]);
                    }
                }
            }
            return result;
        },

        setDataTemplateData: function (eventObject) {
            //traverse all the data template and get all the serie data required
            var dataTemplate = this._dataTemplate, i, ilength, symbolData, j, jlength, dataCell,
                chart = eventObject.chart, renderer = this._plugin, eGraphIndex = eventObject.pointers[0].graphIndex,
                timeStamp = eventObject.pointers[0].timeStamp, graph = eventObject.pointers[0].graph, serieStorage, key, serie, dataValue, formattedValue, layerPoint,
                graphIndex, axisIndex, serieIndex, valueKey, dataObject, cnt,
                dataInspect = eventObject.chart.engine.dataInspect(graph, timeStamp);
                //dataInspect = graph.dataInspect(timeStamp);

            serieStorage = this.createDataInspectMap(eventObject.pointers[0].graphIndex, dataInspect);

            ilength = dataTemplate.length;

            for (i = 0; i < ilength; i++) {
                cnt = 0;
                symbolData = dataTemplate[i];
                jlength = symbolData.length;
                for (j = 0; j < jlength; j++) {
                    dataCell = symbolData[j];
                    if (dataCell && dataCell.graph >= 0) {
                        graphIndex = dataCell.graph;
                        axisIndex = dataCell.axis;
                        serieIndex = dataCell.serie;
                        valueKey = dataCell.key;
                        key = this.createSerieKey(dataCell.graph, dataCell.axis, dataCell.serie);
                        dataObject = serieStorage[key];
                        if (!dataObject && eGraphIndex !== graphIndex) {
                        //if (!dataObject) {
                            serie = chart.graphs(graphIndex).axes(axisIndex).series(serieIndex);
                            dataInspect = serie.dataInspect(timeStamp);
                            if (dataInspect) {
                                dataObject = this.createSerieDataInspect(serieStorage, graphIndex, axisIndex, serieIndex, dataInspect);
                            }
                        }
                        dataValue = renderer.data(i)(j);
                        if (dataObject) {
                            cnt++;
                            layerPoint = dataObject[valueKey];
                            formattedValue = dataCell.formatter ? dataCell.formatter(layerPoint.value) : (layerPoint.formattedValue || layerPoint.value);
                            dataValue.data(formattedValue);
                            dataValue.cssText(dataObject[valueKey].color ? 'color: ' + dataObject[valueKey].color : '');
                        } else {
                            dataValue.data('');
                            dataValue.cssText('');
                        }
                    }
                }
                renderer.symbols(i).visible(cnt > 0);
            }
        },

        downGesture: function (eventObject) {
            if (!this.settings.alwaysEnabled && this._plugin) {
                this.disposeRenderer();
                delete this._plugin;
            }
            if (eventObject.pointers[0].region && (eventObject.pointers[0].region.type === 'series' || eventObject.pointers[0].region.type === 'header') && (eventObject.button === 1 || eventObject.button === null) && !this.settings.alwaysEnabled) {
                this._timer =
                    setTimeout(
                        function () {
                            this._plugin = true; //just to signal start
                            delete this._graphIndex;
                            this._enabled = true;
                            this.moveGesture(eventObject);
                        }.bind(this),
                        this.settings.delay);

                return this.settings.forwardEvent;
            } else {
                return true;
            }
        },

        moveGesture: function (eventObject) {

            if (eventObject.pointers.length && eventObject.pointers[0].region && (eventObject.pointers[0].region.type === 'series' || eventObject.pointers[0].region.type === 'header')) {
                
                var left, top,
                    renderer = this._plugin, dataTemplate,
                    $element, $parent = $('body'),
                    settings = this.settings,
                    center = eventObject.pointers[0].barSlotCenter, i, length, invertX, invertY,
                    offset, refresh = false, dataTipStyle, crosshairs,
                    formatter, leftAxisWidth, enabled,
                    childWidth, childHeight,
                    width, height;

                enabled = this._enabled || settings.alwaysEnabled;

                if (enabled) {
                    if (!renderer) {
                        this._plugin = true;
                        renderer = true;
                    } else {
                        if (this._hidden) {
                            delete this._hidden;
                            dataTipStyle = '';
                            if (renderer.setHostCssText) {
                                renderer.setHostCssText(dataTipStyle);
                            }
                        }
                    }
                } else {
                    this.disposeRenderer(this);
                    renderer = null;
                }

                if (renderer && eventObject.pointers[0].graphIndex >= 0) {
                    if (this._graphIndex !== eventObject.pointers[0].graphIndex || $(this.settings.parent).get(0) !== $(renderer.domElement).get(0)) { // || !e.timeStamp) {
                        refresh = true;
                        this.disposeRenderer();
                        $parent = (this.settings.parent && $(this.settings.parent)) || $('body');
                        renderer = this.createRenderer($parent, eventObject);

                        this._graphIndex = eventObject.pointers[0].graphIndex;

                    }
                    refresh = refresh || eventObject.pointers[0].timeStamp !== this._lastTimeStamp;

                    this._lastTimeStamp = eventObject.pointers[0].timeStamp;
                    this._graphIndex = eventObject.pointers[0].graphIndex;

                    formatter = this._timeFormatter;

                    renderer.time.data(formatter(eventObject.pointers[0].timeStamp));


                    if (eventObject.pointers[0].prices) {
                        dataTemplate = this._dataTemplate;
                        crosshairs = renderer.crosshairValues();
                        length = crosshairs.length;
                        for (i = 0; i < length; i++) {
                            renderer.crosshairValues(i).data(eventObject.pointers[0].prices[dataTemplate[i][0].axis].formattedValue);
                        }
                    }

                    if (refresh) {
                        this.setDataTemplateData(eventObject);
                    }

                    if (!this.settings.parent) {

                        leftAxisWidth = eventObject.chart.getViewPortLeftMargin();

                        $element = eventObject.chart.$chartElement();

                        width = $element.width();
                        height = $element.height();
                        offset = $element.offset();

                        left = offset.left + center + leftAxisWidth; // e.clientX+10;
                        top = offset.top + eventObject.pointers[0].y;// + 10;

                        $element = $(renderer.$domElement.children()[0]);

                        childWidth = $element.outerWidth();
                        childHeight = $element.outerHeight();

                        invertX = (left + childWidth) > offset.left + width;

                        invertY = top + childHeight > offset.top + height;

                        if (invertX) {
                            left = left - childWidth;
                        }

                        // ensure not running off the page
                        if (invertY && top - childHeight > 60) {
                            top = top - childHeight;
                        }

                        dataTipStyle = 'position:absolute; top: ' + top + 'px; left: ' + left + 'px';
                        renderer.setHostCssText(dataTipStyle);

                    }

                    return this.settings.forwardEvent;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        },

        upGesture: function (eventObject) {
            //return true;
            delete this._enabled;
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            if (this._plugin && !this.settings.alwaysEnabled) {
                this.disposeRenderer();
                return this.settings.forwardEvent;
            } else {
                return true;
            }
        }

    });
});
