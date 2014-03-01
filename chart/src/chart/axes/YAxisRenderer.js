define([
    'dcl/dcl',
    'jquery',
    'common/Utilities',
    'chart/axes/YAxisPosition',
    'common/Rect',
    'chart/axes/YAxisLabelRenderer',
    'chart/axes/YAxisIndicationRenderer',
    'chart/axes/YAxisHorizontalLineRenderer'
], function(dcl, $, utilities, yAxisPosition, rect, YAxisLabelRenderer, YAxisIndicationRenderer, YAxisHorizontalLineRenderer){

    var
        physicalWith = 120;

    return dcl(null, {
        declaredClass:'YAxisRenderer',
        constructor: function ($parent, settings) {
                this.$parent = $($parent);

                this.settings = settings;

                this.id = utilities.idGenerator('yaxis');

                this.domNode = utilities.dom('div', {
                    css:'YAxisRenderer',
                    style:{
                        //zIndex:settings.axisZOrder,
                        position:'absolute',
                        //userSelect: 'none',
                        left: '0px',
                        top:'0px',
                        width: physicalWith
                    }
                }, $parent);

                this._parentWidth = 0;

                this._labelAndIndicationRect = rect();

                this.labelRenderer = new YAxisLabelRenderer(this.domNode, {
                    axisPosition: settings.axisPosition,
                    rect: this._labelAndIndicationRect,
                    scaler: settings.scaler,
                    minMove: settings.minMove,
                    numberFormat: settings.numberFormat,
                    showLabels: settings.showLabels,
                    labelAxisDistance: settings.labelAxisDistance,
                    labelBorderDistance: settings.labelBorderDistance,
                    theme:settings.theme
                });

                this.rect = utilities.settingProperty(settings, 'rect', function () {
                    console.log('YRECT');
                    this._resize();
                }.bind(this));

                this.axisWidth = utilities.settingProperty(settings, 'axisWidth', function () {
                    this._resize();
                }.bind(this));

                this.showLabels = utilities.settingProperty(settings, 'showLabels', function (showLabels, prevShowValue) {
                    if (prevShowValue !== showLabels) {
                        this.labelRenderer.showLabels(showLabels);
                        if (showLabels) {
                            this._createIndicationRenderer(this._labelAndIndicationRect);
                        } else {
                            this._disposeIndicationRenderer();
                        }
                    }
                }.bind(this));

                this.showHorizontalLines = utilities.settingProperty(settings, 'showHorizontalLines', function (showHorizontalLines, prevHorizontalLines) {
                    if (prevHorizontalLines !== showHorizontalLines) {
                        if (showHorizontalLines) {
                            this._createHorizontalLineRenderer(rect());
                            this._setHorizontalLineRendererRect();
                            this.horizontalLineRenderer.render();
                        } else {
                            this._disposeHorizontalLineRenderer();
                        }
                    }
                }.bind(this));

                this.axisPosition = utilities.settingProperty(settings, 'axisPosition', function (iAxisPosition) {
                    this.labelRenderer.axisPosition(iAxisPosition);
                    if (this.indicationRenderer) {
                        this.indicationRenderer.axisPosition(iAxisPosition);
                    }
                    this._resize();
                }.bind(this));

                this.numberFormat = utilities.settingProperty(settings, 'numberFormat', function(numberFormat) {
                    this.labelRenderer.numberFormat(numberFormat);
                }.bind(this));

                this.formatter = utilities.settingProperty(settings, 'formatter', function (formatter) {
                    if (this.indicationRenderer) {
                        this.indicationRenderer.formatter(formatter);
                    }
                }.bind(this));



                this.scaler = utilities.settingProperty(settings, 'scaler', function (scaler) {

                    this.labelRenderer.scaler(scaler);

                    if (this.indicationRenderer) {
                        this.indicationRenderer.scaler(scaler);
                    }
                }.bind(this));

                this._horizontalLineRect = null;

                this.horizontalLineRenderer = null;

                if (settings.showHorizontalLines) {
                    this._createHorizontalLineRenderer(rect());
                }

                this.indicationRenderer = null;

                if (settings.showLabels) {
                    this._createIndicationRenderer(rect());
                }

                var iRect = settings.rect;

                if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                    this._resize();
                }
            },

            changeFormat: function(numberFormat, formatter) {
                this.labelRenderer.numberFormat(numberFormat);

                if (this.indicationRenderer) {
                    this.indicationRenderer.formatter(formatter);
                }
            },

            changeRectAndAxisWidth: function(iRect, axisWidth) {
                this._updateRectAndAxisWidth(iRect, axisWidth);
            },

            changeRectAndAxisWidthAndLablesVisibility: function(iRect, axisWidth, showLabels) {

                this.settings.showLabels = showLabels;
                this.labelRenderer.showLabels(showLabels);

                this._updateRectAndAxisWidth(iRect, axisWidth);
            },

            changeRectAndAxisWidthAndHorizontalLinesVisibility: function(iRect, axisWidth, showHorizontalLines) {

                this.settings.showHorizontalLines = showHorizontalLines;
                //TODO: create the HorizontalLinesRenderer

                this._updateRectAndAxisWidth(iRect, axisWidth);
            },

            computeRecommendedWidth: function(text) {
                return this.labelRenderer.computeRecommendedWidth(text);
            },

            render: function() {
                this.labelRenderer.render();
                if (this.settings.showHorizontalLines) {
                    if (this.labelRenderer.labelsSignature !== this.horizontalLineRenderer.settings.labelsSignature) {
                        this.horizontalLineRenderer.labels(this.labelRenderer.labels, this.labelRenderer.labelsSignature);
                    }
                    this.horizontalLineRenderer.render();
                }
            },

            _updateRectAndAxisWidth: function(iRect, axisWidth) {
                this.settings.rect = iRect;
                this.settings.axisWidth = axisWidth;
                this._resize();
            },

            _resize: function() {
                var settings = this.settings,
                    axisRect = settings.rect,
                    labelAndIndicacionRect = this._labelAndIndicationRect,
                    newParentWidth = this.$parent.width();

                if (settings.axisPosition === yAxisPosition.left) {

                    if (settings.showHorizontalLines) {
                        this._setHorizontalLineRendererRect(yAxisPosition.left);
                    }

                    labelAndIndicacionRect.left = 0;
                    labelAndIndicacionRect.right = settings.axisWidth;
                    labelAndIndicacionRect.bottom = axisRect.bottom;

                    utilities.style(this.domNode, 'left', '0px');

                }
                else if (settings.axisPosition === yAxisPosition.right) {
                    if (settings.showHorizontalLines) {
                        this._setHorizontalLineRendererRect(yAxisPosition.right);
                    }

                    labelAndIndicacionRect.left = physicalWith - settings.axisWidth;
                    labelAndIndicacionRect.right = physicalWith;
                    labelAndIndicacionRect.bottom = axisRect.bottom;

                    utilities.style(this.domNode, 'left', (newParentWidth - physicalWith) + 'px');
                }

                this._parentWidth = newParentWidth;

                if (utilities.box(this.domNode).height !== axisRect.bottom) {
                    utilities.style(this.domNode, 'height', axisRect.bottom);
                }

                this.labelRenderer.rect(labelAndIndicacionRect);

                if (this.indicationRenderer) {
                    this.indicationRenderer.rect(labelAndIndicacionRect);
                }
            },

            _createHorizontalLineRenderer: function(horizontalLineRect) {
                this._horizontalLineRect = horizontalLineRect;
                this.horizontalLineRenderer = new YAxisHorizontalLineRenderer(this.$parent, {
                    rect: horizontalLineRect,
                    labels: this.labelRenderer.labels,
                    labelsSignature: Number.MAX_VALUE,
                    theme: this.settings.theme
                    //,zOrder: this.settings.horizontalLinesZOrder
                });
            },

            _setHorizontalLineRendererRect: function(iAxisPosition) {
                var horizontalLinesRect = this._horizontalLineRect,
                    settings = this.settings,
                    axisRect = settings.rect;

                if (iAxisPosition === yAxisPosition.left) {
                    horizontalLinesRect.bottom = axisRect.bottom;
                    horizontalLinesRect.left = settings.axisWidth;
                    horizontalLinesRect.right = axisRect.right;
                } else {
                    horizontalLinesRect = this._horizontalLineRect;

                    horizontalLinesRect.bottom = axisRect.bottom;
                    horizontalLinesRect.left = axisRect.left;
                    horizontalLinesRect.right = axisRect.right - settings.axisWidth;
                }

                this.horizontalLineRenderer.rect(horizontalLinesRect);
            },

            _disposeHorizontalLineRenderer: function() {
                if (this.horizontalLineRenderer) {
                    this._horizontalLineRect = null;
                    this.horizontalLineRenderer.dispose();
                    this.horizontalLineRenderer = null;
                }
            },

            _createIndicationRenderer: function(iRect) {
                this.indicationRenderer = new YAxisIndicationRenderer(this.domNode, {
                    rect: iRect,
                    axisPosition: this.settings.axisPosition,
                    scaler: this.settings.scaler,
                    formatter: this.settings.formatter,
                    labels: this.settings.indicationLabels,
                    labelAxisDistance: this.settings.labelAxisDistance,
                    theme: this.settings.theme
                });
            },

            _disposeIndicationRenderer: function() {
                if (this.indicationRenderer) {
                    this.indicationRenderer.dispose();
                    this.indicationRenderer = null;
                }
            },

            dispose: function() {
                this.labelRenderer.dispose();
                this.labelRenderer = null;
                this._labelAndIndicationRect = null;
                this._disposeHorizontalLineRenderer();
                this._disposeIndicationRenderer();
                this.changeFormat = null;
                this.rect =null;
                this.axisWidth = null;
                this.showLabels = null;
                this.axisPosition = null;
                this.formatter = null;
                this.numberFormat = null;
                this.scaler = null;
                utilities.destroy(this.domNode);
                this.domNode = null;
                this.settings = null;
                this.$parent = null;
            }
    });
});
