define(
    [

    ], function () {

        function GraphResizingHelper() {

        }


        var lastGraphs = [], rollingPercentages = [],

            getRollingPercentages = function (graphs, chartHeight, index) {
                var length = graphs.length, i, rollingPercentage = 0, percentage = 0, rect,
                    value, graph, accum = 0,
                    result = rollingPercentages;

                if (index === undefined) {
                    index = length;
                }
                if (result.length !== length) {
                    result.length = length;
                }

                for (i = 0; i <= index + 1 && i < length; i++) {
                    value = result[i];
                    if (!value) {
                        value = {};
                        result[i] = value;
                    }

                    graph = graphs[i];

                    percentage = graph.realEstatePercentage();
                    accum += percentage;

                    value.rollingPercentage = rollingPercentage;

                    value.realEstatePercentage = percentage;

                    value.headerHeight = graph.header().height();
                    value.headerPercentage = value.headerHeight / chartHeight;

                    value.minDataHeight = graph.minDataHeight();
                    value.minDataHeightPercentage = value.minDataHeight / chartHeight;

                    rect = graph.getRect();
                    value.availableHeight = rect.bottom - rect.top - value.headerHeight - value.minDataHeight;
                    value.availablePercentage = value.availableHeight / chartHeight;

                    rollingPercentage += percentage;
                }

                if (accum != 1) {
                    for (i = 0; i < length; i++) {
                        value = result[i];
                        value.rollingPercentage /= accum;
                        value.realEstatePercentage /= accum;
                        value.availablePercentage = value.realEstatePercentage - value.headerPercentage;
                    }
                }

                return result;
            },

        getGraphRealEstate = function (chartHeight, rollingPercentage, percentage, lastTop, result) {
            if (!result) {
                result = {};
            }
            result.realEstatePercentage = percentage;
            result.minHeight = lastTop;
            result.maxHeight = rollingPercentage * chartHeight + percentage * chartHeight;
            return result;
        },
            getGraphsRealEstates = function (chartHeight, graphs) {
                var grphs = utilities.getValue(graphs), length = grphs.length, i,
                    lastTop = 0, sumPercentage = 0, percentage,
                result = lastGraphs;
                if (result.length !== length) {
                    result.length = length;
                }
                for (i = 0; i < length; i++) {
                    percentage = grphs[i].realEstatePercentage();
                    result[i] = getGraphRealEstate(chartHeight, sumPercentage, percentage, lastTop, result[i]);
                    sumPercentage += percentage;
                    lastTop = result[i].maxHeight;
                }
                return result;
            };

        GraphResizingHelper.prototype = {

            init: function (object, settings) {
                object.settings = settings || {};

                //object.settings.height = object.settings.height || 20;
                object.settings.dividerTemplate = object.settings.dividerTemplate || '<div style="position:absolute"> </div>';
                object._splitters = [];
                //object._$parent = $(object.settings.parent) || $('body');
            },


            createSplitter: function (object, chart, index) {
                var template = object.settings.dividerTemplate, result = $(template).clone(),
                    eResult = result.get(0),
                    $chartElement = chart.$chartElement(), data = {},
                    graphIndex = index;

                var onLocalMouseMove = function(e) {
                    //if dragging
                    if (object._resizing) {
                        self.mouseMove(object, chart, e);
                        //chart.triggerGesture('move', data);
                    }
                };

                result.on('mousemove', onLocalMouseMove);

                var onLocalMouseDown = function(e) {
                    //start dragging
                    object._resizing = result;
                    object._graphIndex = graphIndex;
                    self.mouseDown(object, chart, e);
                    //chart.triggerGesture('move', data);
                };

                result.on('mousedown', onLocalMouseDown);
                
                var onLocalMouseUp = function(e) {
                    //stop dragging
                    self.mouseUp(object, chart, e);
                };

                result.on('mouseup', onLocalMouseUp);
                
                if (eResult.addEventListener) {
                    
                    eResult.addEventListener('touchmove', function (e) {
                        //debugger;
                        
                        var newEvent = e;
                        
                        newEvent.clientY = e.touches[0].clientY;
                        onLocalMouseMove(newEvent);
                    }, false);
                    
                    eResult.addEventListener('touchstart', function (e) {
                        //debugger;
                        onLocalMouseDown(e);
                    }, false);

                    eResult.addEventListener('touchend', function (e) {
                        //debugger;
                        onLocalMouseUp(e);
                    }, false);

                }

                return result;
            },

            disposeSplitter: function (splitter) {
                splitter.off();
                splitter.remove();
            },

            disposeAllSpliters: function (object) {
                var splitters = object._splitters, length = splitters && splitters.length, i;
                for (var i = 0; i < length; i++) {
                    self.disposeSplitter(splitters[i]);
                }
                splitters.length = 0;
            },

            setSplitterPosition: function (splitter, rollingPercentage, chartHeight) {
                var splitterHeight = splitter.height(),
                top = rollingPercentage.rollingPercentage * chartHeight + rollingPercentage.realEstatePercentage * chartHeight - splitterHeight;

                splitter.css('top', top + 'px');
            },

            resetSpliterPositions: function (object, rollingPercentages, chartHeight) {
                var i, length = rollingPercentages && rollingPercentages.length,
                    splitters = object._splitters;
                for (i = 0; i < length - 1; i++) {
                    self.setSplitterPosition(splitters[i], rollingPercentages[i], chartHeight);
                    splitters[i].show();
                }
            },

            getPaintableChartHeight: function (chart) {
                var graphs = chart.graphs(),
                    chartHeight = graphs[graphs.length - 1].getRect().bottom;
                return chartHeight;
            },
            refreshSplitters: function (object, chart) {
                var $domElement = chart.$chartElement(),
                    graphs = chart.graphs(),
                    chartHeight = self.getPaintableChartHeight(chart),
                    //chartHeight = $domElement.height(),
                    length, i, splitter, width = $domElement.width(), splitterHeight,
                    top, rollingPercentages;
                this.disposeAllSpliters(object);
                rollingPercentages = getRollingPercentages(chart.graphs(), chartHeight);
                length = rollingPercentages && rollingPercentages.length;
                //one less than the total
                for (i = 0; i < length - 1; i++) {
                    splitter = self.createSplitter(object, chart, i);

                    object._splitters[i] = splitter;

                    splitter.appendTo($domElement);

                    splitter.css('width', width + 'px');
                }
                self.resetSpliterPositions(object, rollingPercentages, chartHeight);
            },

            createChartOverlay: function ($chartElement, overlay, chartHeight) {
                var $element = $(overlay).clone(),
                    width = $chartElement.width(),
                    height = chartHeight;

                $element.css('position', 'absolute');
                $element.css('left', 0 + 'px');
                $element.css('top', 0 + 'px');
                $element.css('width', width + 'px');
                $element.css('height', height + 'px');
                $chartElement.append($element);
                return $element;
            },

            createOverlay: function ($host, overlay, chartHeight, rollingPerc) {
                var $element = $(overlay).clone(),
                    $parent = $host,
                    top, left = 0, height;

                top = rollingPerc.rollingPercentage * chartHeight;
                height = (rollingPerc.rollingPercentage + rollingPerc.realEstatePercentage) * chartHeight - top;

                $element.css('position', 'absolute');
                $element.css('left', left + 'px');
                $element.css('top', top + 'px');
                $element.css('width', '100%');
                $element.css('height', height + 'px');
                $host.append($element);
                return $element;
            },

            createOverlays: function (object, chart) {
                //create the chart overlay
                var $chartElement = chart.$chartElement(), options = object.settings, $background,
                    rollingPercs, i, length, graphOverlays = [], $graphOverlay,
                    up, move, chartHeight = self.getPaintableChartHeight(chart);

                $background = self.createChartOverlay($chartElement, options.chartOverlayTemplate, chartHeight);

                up = function (e) {
                    self.mouseUp(object, chart, e);
                };

                move = function (e) {
                    self.mouseMove(object, chart, e);
                };

                $background.on('mouseup', up);

                $background.on('mousemove', move);

                object._$background = $background;
                //create the transparent overlays for the subgraphs
                rollingPercs = getRollingPercentages(chart.graphs(), chartHeight);
                length = rollingPercs.length;
                for (i = 0; i < length; i++) {
                    $graphOverlay = self.createOverlay($chartElement, options.graphOverlayTemplate, chartHeight, rollingPercs[i]);
                    graphOverlays.push({
                        percentageInfo: rollingPercs[i],
                        $overlay: $graphOverlay
                    });

                    $graphOverlay.on('mouseup', up);
                    $graphOverlay.on('mousemove', move);
                }
                object._graphOverlays = graphOverlays;
                object._chartHeight = chartHeight;
            },

            destroyOverlays: function (object) {
                var $background = object._$background,
                    graphOverlays = object._graphOverlays, length = graphOverlays.length, i;
                $background.off();
                $background.remove();

                for (i = 0; i < length; i++) {
                    graphOverlays[i].$overlay.off();
                    graphOverlays[i].$overlay.remove();
                }
                object._$background = null;
                object._graphOverlays = null;
            },


            mouseDown: function (object, chart, e) {
                if (object._$background) {
                    self.mouseUp(object, chart, e);
                } else {
                    object._docMouseUp = function(e) {
                        return self.mouseUp(object, chart, e);
                    };
                    $(document).on('mouseup', object._docMouseUp);
                    //create the divs with the percentages from the chart
                    self.createOverlays(object, chart);
                    //forward the move
                    self.mouseMove(object, chart, e);
                }
                e.preventDefault();
            },

            mouseMove: function (object, chart, eventObject) {
                if (!object._splitters || !object._splitters.length) {
                    self.refreshSplitters(object, eventObject.chart);
                } else {
                    if (object._resizing) {
                        var overlays = object._graphOverlays, canResize, overlay,
                            direction, i, top, height, newTop,
                            rollPercs, splitters, settings = object.settings,
                            rollPerc, newTotalRollingPercentage,
                            percentAvailable = 0, length, newPercentage,
                            splitterIndex = object._graphIndex,
                            newGraphPercentages = [], total = 0,
                            chartHeight, bottom,
                            distance, distanceAvailable, availableHeight,
                            lastY = object._lastY;
                        //console.log(eventObject.clientY);
                        if (lastY) {
                            //chartCoordinates = self.calculateChartCoordinates(eventObject);
                            //rollPercs = chartCoordinates.rollingPercentages;
                            length = overlays.length;
                            distance = eventObject.clientY - object._lastY;
                            chartHeight = object._chartHeight;

                            //if distance !== 0
                            if (distance) {
                                //console.log('distance: '+distance);
                                direction = distance > 0 ? 1 : -1;

                                if (direction > 0) {
                                    splitterIndex = object._graphIndex;

                                    top = overlays[splitterIndex].$overlay.position().top;
                                    height = overlays[splitterIndex].$overlay.height();

                                    newTop = top + height + distance;

                                    overlay = overlays[splitterIndex + 1];

                                    if (newTop < overlay.$overlay.position().top + overlay.$overlay.height() - overlay.percentageInfo.headerHeight - overlay.percentageInfo.minDataHeight) {
                                        overlays[splitterIndex].$overlay.css('height', (newTop - top) + 'px');
                                        overlays[splitterIndex + 1].$overlay.css('top', newTop + 'px');
                                        overlays[splitterIndex + 1].$overlay.css('height', (overlays[splitterIndex + 1].$overlay.height() - distance) + 'px');
                                    } else {

                                        //determine how many graphs will be affected

                                        //move the index to the next overlay
                                        i = splitterIndex + 1;

                                        //distance has not been affected 
                                        distanceAvailable = distance;


                                        //while distance and overlays
                                        while (distanceAvailable > 0 && i < length) {

                                            //get the overlay
                                            overlay = overlays[i];

                                            //get the height
                                            height = overlay.$overlay.height();

                                            //cache the calculation
                                            overlay.percentageInfo.height = height;

                                            //lets calculate how much height we have available
                                            availableHeight = height - overlay.percentageInfo.headerHeight - overlay.percentageInfo.minDataHeight;

                                            if (distanceAvailable > availableHeight) {
                                                height = overlay.percentageInfo.headerHeight + overlay.percentageInfo.minDataHeight;
                                            } else {
                                                height = overlay.percentageInfo.headerHeight + overlay.percentageInfo.minDataHeight + availableHeight - distanceAvailable;
                                            }

                                            //set the new height
                                            overlay.percentageInfo.newHeight = height;

                                            //affect the distance available by the difference between the new height and the current height
                                            distanceAvailable -= (overlay.percentageInfo.height - overlay.percentageInfo.newHeight);

                                            i++;
                                        }

                                        if (distanceAvailable > 0) {
                                            distance -= distanceAvailable;
                                        }

                                        if (i >= length) {
                                            i--;
                                        }
                                        overlay = overlays[i];
                                        bottom = overlay.$overlay.position().top + overlay.percentageInfo.height;

                                        while (i > splitterIndex) {
                                            overlay = overlays[i];
                                            overlay.$overlay.css('height', overlay.percentageInfo.newHeight + 'px');
                                            top = bottom - overlay.percentageInfo.newHeight;
                                            overlay.$overlay.css('top', top + 'px');
                                            bottom -= overlay.percentageInfo.newHeight;
                                            i--;
                                        }

                                        overlay = overlays[i];
                                        height = overlay.$overlay.height();
                                        overlay.$overlay.css('height', (height + distance) + 'px');
                                    }

                                } else {
                                    //index = object._graphIndex;

                                    overlay = overlays[splitterIndex];

                                    top = overlay.$overlay.position().top;

                                    rollPerc = overlay.percentageInfo;

                                    height = overlay.$overlay.height() + distance;

                                    //newTotalRollingPercentage = rollPerc.rollingPercentage + rollPerc.realEstatePercentage + distancePercent;

                                    if (height - rollPerc.headerHeight - rollPerc.minDataHeight >= 0) {
                                        overlays[splitterIndex].$overlay.css('height', height + 'px');
                                        overlays[splitterIndex + 1].$overlay.css('top', (top + height) + 'px');
                                        overlays[splitterIndex + 1].$overlay.css('height', (overlays[splitterIndex + 1].$overlay.height() - distance) + 'px');
                                    } else {
                                        //determine how many graphs will be affected

                                        //move the index to the next overlay
                                        i = splitterIndex;

                                        //distance has not been affected
                                        distanceAvailable = -distance;

                                        //while distance and overlays
                                        while (distanceAvailable > 0 && i >= 0) {

                                            //get the overlay
                                            overlay = overlays[i];

                                            //get the height
                                            height = overlay.$overlay.height();

                                            //cache the calculation
                                            overlay.percentageInfo.height = height;

                                            //lets calculate how much height we have available
                                            availableHeight = height - overlay.percentageInfo.headerHeight - overlay.percentageInfo.minDataHeight;

                                            if (distanceAvailable > availableHeight) {
                                                height = overlay.percentageInfo.headerHeight + overlay.percentageInfo.minDataHeight;
                                            } else {
                                                height = overlay.percentageInfo.headerHeight + overlay.percentageInfo.minDataHeight + availableHeight - distanceAvailable;
                                            }

                                            //set the new height
                                            overlay.percentageInfo.newHeight = height;

                                            //affect the distance available by the difference between the new height and the current height
                                            distanceAvailable -= (overlay.percentageInfo.height - overlay.percentageInfo.newHeight);

                                            i--;
                                        }

                                        if (distanceAvailable > 0) {
                                            distance += distanceAvailable;
                                        }

                                        if (i < 0) {
                                            i = 0;
                                        }

                                        overlay = overlays[i];
                                        bottom = overlay.$overlay.position().top;

                                        while (i <= splitterIndex) {
                                            overlay = overlays[i];
                                            overlay.$overlay.css('height', overlay.percentageInfo.newHeight + 'px');
                                            top = bottom;
                                            overlay.$overlay.css('top', top + 'px');
                                            bottom += overlay.percentageInfo.newHeight;
                                            i++;
                                        }

                                        overlay = overlays[i];
                                        top = bottom;
                                        overlay.$overlay.css('top', top + 'px');
                                        height = overlay.$overlay.height();
                                        overlay.$overlay.css('height', (height - distance) + 'px');
                                    }
                                }

                                top = object._resizing.position().top;
                                top += distance;
                                object._resizing.css('top', top + 'px');
                            }
                        } else {
                            //hide all the other splitters so no conflicts
                            splitters = object._splitters;
                            length = splitters.length;
                            for (i = 0; i < length; i++) {
                                if (splitterIndex !== i) {
                                    splitters[i].hide();
                                }
                            }
                        }

                        object._lastY = eventObject.clientY;
                        //console.log('------------------------------------------------');
                    }
                }
                eventObject.preventDefault();
            },

            mouseUp: function (object, chart, e) {
                if (object._graphOverlays) {
                    var overlays = object._graphOverlays, length = overlays.length, i, settings = object.settings,
                        chartHeight = self.getPaintableChartHeight(chart), splitters = object._splitters, bottom,
                        $overlay, height, top, rollingPercs,
                        newPercentage, newGraphPercentages = [], total = 0, canResize;

                    for (i = 0; i < length; i++) {
                        $overlay = overlays[i].$overlay;
                        height = $overlay.height();
                        newPercentage = height / chartHeight;
                        total += newPercentage;
                        newGraphPercentages.push(newPercentage);

                        top = $overlay.position().top;
                        bottom = top + height;

                        if (splitters[i]) {
                            splitters[i].show();
                            height = splitters[i].height();

                            top = bottom - height;
                            splitters[i].css('top', top + 'px');
                        }
                    }

                    canResize = settings.onGraphsResizing === undefined || settings.onGraphsResizing(newGraphPercentages);

                    if (canResize) {
                        newGraphPercentages = chart.distributeGraphs(newGraphPercentages);

                        if (settings.onGraphsResized) {
                            settings.onGraphsResized(newGraphPercentages);
                        }
                    } else {
                        rollingPercs = getRollingPercentages(chart.graphs(), chartHeight);
                        self.resetSpliterPositions(object, rollingPercs, chartHeight);
                    }

                    self.destroyOverlays(object);

                    object._resizing = undefined;
                    object._lastY = undefined;

                    $(document).off('mouseup', object._docMouseUp);
                    object._docMouseUp = null;
                }
                e.preventDefault();
            },

            calculateChartCoordinates: function (eventObject) {
                var chart = eventObject.chart,
                    $chartElement = chart.$chartElement(),
                    //chartHeight = $chartElement.height(),
                    graphs = chart.graphs(),
    chartHeight = graphs[graphs.length - 1].getRect().bottom,
                    graphIndex = eventObject.graphIndex,
                    graphRollingPercentage = 0,
                    graphRealEstatePercentage,
                    //graphYOffset = 0, leftAxisWidth,
                    data = {},
                    chartX, chartY, rollingPercs;
                if (graphIndex >= 0) {
                    rollingPercs = getRollingPercentages(chart.graphs(), chartHeight);

                    //graphRollingPercentage = rollingPercs[graphIndex - 1].rollingPercentage;
                    //graphRealEstatePercentage = rollingPercs[graphIndex - 1].realEstatePercentage;

                    //if (graphIndex) {
                    //    graphYOffset = graphRollingPercentage * chartHeight;
                    //}
                    chartY = eventObject.y;

                    //leftAxisWidth = chart.getViewPortLeftMargin();
                    chartX = eventObject.x;

                    data.chartX = chartX;
                    data.chartY = chartY;
                    data.rollingPercentages = rollingPercs;
                    data.chartHeight = chartHeight;
                    data.$chartElement = $chartElement;
                    //data.graphRollingPercentage = graphRollingPercentage;
                    //data.graphRealEstatePercentage = graphRealEstatePercentage;
                }
                return data;
            },

            onMoveGesture: function (object, eventObject) {
                if (!object._splitters || !object._splitters.length) {
                    self.refreshSplitters(object, eventObject.chart);
                } else {
                    return true;
                }
            },

            onUpGesture: function (object, eventObject) {
                if (object._resizing) {
                    object._resizing = undefined;
                    object._lastY = undefined;

                    if (eventObject.chart) {
                        var chartCoordinates = self.calculateChartCoordinates(eventObject);
                        self.resetSpliterPositions(object, chartCoordinates.rollingPercentages, chartCoordinates.chartHeight);
                    }
                }
            },

            onDownGesture: function (object, eventObject) {

            },
            dispose: function () {
            }
        };

        GraphResizingHelper.prototype.constructor = GraphResizingHelper;

        var self = new GraphResizingHelper();

        return self;
    }
);
