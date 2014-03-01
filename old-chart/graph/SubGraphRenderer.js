define([
    'dcl/dcl',
    'jquery',
    'common/Utilities',
    'common/Rect',
    '../group/YScaleGroupRenderer',
    '../axes/YAxisPosition',
    'common/RegionTypes',
    'common/EventTarget',
    '../userVisualFeedback/CrosshairRenderer'
], function (dcl, $, utilities, rect, YScaleGroupRenderer, yAxisPosition, regionTypes, EventTarget, CrosshairRenderer) {

    // SubGraphRenderer is a container for the serie, header, and yAxis

    function noop(){}
    
    return dcl(null, {
        declaredClass:'SubGraphRenderer',
        constructor: function($parent, settings){

            var
                self = this,
                iRect,
                horizontalLinesZOrder = settings.minZOrder,
                headerZOrder = settings.maxZOrder,
                crosshairZOrder = headerZOrder - 1,
                axisZOrder = crosshairZOrder - 1,
                maxSelectionZOrder = axisZOrder - 1,
                serieZOrderSlotSize = 16,
                yScaleGroupzOrderSlotSize = 10 * serieZOrderSlotSize,
                labelAxisDistance = 12,
                labelBorderDistance = 2;

            this.settings = settings;
            this.$parent = $parent;
            this.id = settings.id;

            this.domNode = utilities.dom('div', {
                css:'subGraphBody',
                style:{
                    position:'absolute',
                    top:0,
                    left:0,
                    overflow:'hidden'
                }
            }, $parent);

            this.yScaleGroupsMap = {};
            this.yScaleGroupLeft = null;
            this.yScaleGroupRight = null;
            this._upFrontTarget = null;
            this._regions = [];
            this._serieZOrder = horizontalLinesZOrder + 1;

            this.rect = utilities.settingProperty(settings, 'rect', function () { this._resize(); });

            this.realEstatePercentage = utilities.settingProperty(settings, 'realEstatePercentage');

            this.headerNode = utilities.dom('div', {
                css:'subGraphHeader',
                style:{
                    height: settings.headerHeight,
                    overflow:'hidden',
                    position:'absolute',
                    top:0,
                    left:settings.leftAxisWidth,
                    zIndex: headerZOrder
                }
            }, this.domNode);

            this._headerRect = rect();

            this.headerDomElement = utilities.settingProperty(settings, 'headerDomElement', function (newHeaderDomElement) {
                this.headerNode.innerHTML = newHeaderDomElement;
            }.bind(this));

            this.onHeaderRectChanged = utilities.settingProperty(settings, 'onHeaderRectChanged');

            this.headerHeight = utilities.settingProperty(settings, 'headerHeight', function (newHeaderHeight) {
                utilities.style(this.headerNode, 'height', newHeaderHeight);
                this._headerRect.bottom = this._headerRect.top + newHeaderHeight;

                if (settings.onHeaderRectChanged) {
                    settings.onHeaderRectChanged(this._headerRect);
                }
                this._resize();
            }.bind(this));


            this.createGroups = function (objectSetting) {
                var
                    axisWidth = 0,
                    settings = this.settings;

                if (objectSetting.axisPosition === yAxisPosition.left) {
                    axisWidth = this.settings.leftAxisWidth;
                } else if (objectSetting.axisPosition === yAxisPosition.right) {
                    axisWidth = this.settings.rightAxisWidth;
                }

                iRect = this.rect();

                return new YScaleGroupRenderer(
                    this.domNode,
                    utilities.mixin(
                        objectSetting, {
                            indexedData: settings.indexedData,
                            painterFactory: settings.painterFactory,
                            headerHeight: settings.headerHeight,
                            axisWidth: axisWidth,
                            labelAxisDistance: labelAxisDistance,
                            labelBorderDistance: labelBorderDistance,
                            horizontalLinesZOrder: horizontalLinesZOrder,
                            axisZOrder: axisZOrder,
                            serieZOrder: this._serieZOrder,
                            serieZOrderSlotSize: serieZOrderSlotSize,
                            maxSelectionZOrder: maxSelectionZOrder,
                            rect: rect(iRect.top, iRect.left, iRect.bottom, iRect.right),
                            isSelectionChangeCallback: function (eventTarget, isSelection) {

                                if (isSelection) {
                                    if (eventTarget.target.constructor.name === 'SerieSectionRenderer') {
                                        eventTarget.targetParent.targetParent.targetParent = new EventTarget(this);
                                        this._upFrontTarget = eventTarget;
                                    }

                                } else {
                                    this._upFrontTarget = null;
                                }
                            }.bind(this),
                            theme:settings.theme
                        }
                    )
                );
            };

            this.yScaleGroups = utilities.settingArrayPropertyProxy(
                settings.yScaleGroups,
                this.addGroup.bind(this),
                noop,
                this.removeGroup.bind(this),
                this.clearGroups.bind(this),
                this.createGroups.bind(this)
            );

            this.headerDomElement(settings.headerDomElement);

            iRect = settings.rect;

            if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                this._resize();
            }

            this._crosshairRenderer =
                new CrosshairRenderer(
                    this.domNode, {
                        rect: rect(),
                        zOrder: crosshairZOrder,
                        theme: settings.theme,
                        leftAxisWidth: settings.leftAxisWidth,
                        rightAxisWidth: settings.rightAxisWidth,
                        labelAxisDistance: labelAxisDistance,
                        labelBorderDistance: labelBorderDistance
                    }
                );
        },

        addGroup: function (index, addedObject) {

            if (addedObject.settings.axisPosition === yAxisPosition.left) {
                this.yScaleGroupLeft = addedObject;
            } else if (addedObject.settings.axisPosition === yAxisPosition.right) {
                this.yScaleGroupRight = addedObject;
            }

            this.yScaleGroupsMap[addedObject.id] = {
                object: addedObject
            };

            this._serieZOrder += 1;//yScaleGroupzOrderSlotSize;
        },

        removeGroup: function (index, removedObjects) {
            var
                length = removedObjects.length,
                object,
                map = this.yScaleGroupsMap;

            for (object = removedObjects[0]; length; object = removedObjects[--length]) {
                if (object.settings.axisPosition === yAxisPosition.left) {
                    this.yScaleGroupLeft = null;
                } else if (object.settings.axisPosition === yAxisPosition.right) {
                    this.yScaleGroupRight = null;
                }
                object.dispose();
                delete map[object.id];
            }
        },

        clearGroups: function (removedObjects) {
            var
                length = removedObjects.length,
                object,
                map = this.yScaleGroupsMap;

            for (object = removedObjects[0]; length; object = removedObjects[--length]) {
                delete map[object.id];
                object.dispose();
            }
            this.yScaleGroupLeft = null;
            this.yScaleGroupRight = null;
        },

        dimensions: function (iRect, rightAxisWidth, leftAxisWidth) {
            this.settings.rect = iRect;
            this.axesWidth(rightAxisWidth, leftAxisWidth);
        },

        axesWidth: function (rightAxisWidth, leftAxisWidth) {

            var
                settings = this.settings;

            settings.leftAxisWidth = leftAxisWidth;
            settings.rightAxisWidth = rightAxisWidth;
            this._resize();
        },

        _resize: function () {
            var settings = this.settings,
                iRect = settings.rect,
                top = iRect.top,
                regionCounter = 0,
                bottom = iRect.bottom,
                height = bottom - top,
                leftAxisWidth = settings.leftAxisWidth,
                rightAxisWidth = settings.rightAxisWidth,
                width = this.$parent.width(),
                yScaleGroupRenderers = this.yScaleGroups(),
                length = yScaleGroupRenderers.length,
                headerHeight = settings.headerHeight,
                regions = this._regions,
                yScaleGroupRenderer, region;

            utilities.style(this.domNode, {
                height:height,
                width:width,
                top:iRect.top
            });

            if (utilities.box(this.headerNode).width !== (width - rightAxisWidth - leftAxisWidth - 1)) {
                utilities.style(this.headerNode, 'width', width - rightAxisWidth - leftAxisWidth - 1);
            }
            utilities.style(this.headerNode, 'left', leftAxisWidth + 1);

            for (yScaleGroupRenderer = yScaleGroupRenderers[0]; length; yScaleGroupRenderer = yScaleGroupRenderers[--length]) {

                iRect = yScaleGroupRenderer.rect();

                iRect.top = 0;
                iRect.bottom = height;

                if (yScaleGroupRenderer.settings.axisPosition === yAxisPosition.left) {

                    iRect.left = 0;
                    iRect.right = width - rightAxisWidth;

                    yScaleGroupRenderer.dimensions(iRect, leftAxisWidth, headerHeight);

                } else if (yScaleGroupRenderer.settings.axisPosition === yAxisPosition.right) {

                    iRect.left = leftAxisWidth;
                    iRect.right = width;

                    yScaleGroupRenderer.dimensions(iRect, rightAxisWidth, headerHeight);

                } else {

                    iRect.left = leftAxisWidth;
                    iRect.right = width - rightAxisWidth;

                    yScaleGroupRenderer.changeRectAndHeaderHeight(iRect, headerHeight);
                }
            }

            if (settings.onHeaderRectChanged) {

                iRect = this._headerRect;

                if (iRect.left !== settings.leftAxisWidth || iRect.right !== settings.rightAxisWidth) {
                    iRect.left = settings.leftAxisWidth;
                    iRect.right = settings.rightAxisWidth;

                    settings.onHeaderRectChanged(iRect);
                }
            }

            // left region
            if (leftAxisWidth > 0) {

                if (regions.length > regionCounter) {
                    region = regions[regionCounter];
                } else {
                    region = {
                        rect: rect(),
                        type: ''
                    };
                    regions[regionCounter] = region;
                }

                region.type = this.yScaleGroupLeft ? regionTypes.leftAxis : regionTypes.empty;
                iRect = region.rect;
                iRect.bottom = bottom;
                iRect.right = leftAxisWidth;

                regionCounter++;
            }

            //center region
            if (regions.length > regionCounter) {
                region = regions[regionCounter];
            } else {
                region = {
                    rect: rect(),
                    type: ''
                };
                regions[regionCounter] = region;
            }

            region.type = regionTypes.series;
            iRect = region.rect;
            iRect.top = headerHeight;
            iRect.bottom = bottom;
            iRect.left = leftAxisWidth;
            iRect.right = width - rightAxisWidth;

            regionCounter++;

            //header region
            if (regions.length > regionCounter) {
                region = regions[regionCounter];
            } else {
                region = {
                    rect: rect(),
                    type: ''
                };
                regions[regionCounter] = region;
            }

            region.type = regionTypes.header;
            iRect = region.rect;
            iRect.top = 0;
            iRect.bottom = headerHeight;
            iRect.left = leftAxisWidth;
            iRect.right = width - rightAxisWidth;

            regionCounter++;

            // right region
            if (rightAxisWidth > 0) {

                if (regions.length > regionCounter) {
                    region = regions[regionCounter];
                } else {
                    region = {
                        rect: rect(),
                        type: ''
                    };
                    regions[regionCounter] = region;
                }

                region.type = this.yScaleGroupRight ? regionTypes.rightAxis : regionTypes.empty;
                iRect = region.rect;
                iRect.bottom = bottom;
                iRect.left = width - rightAxisWidth;
                iRect.right = width;

                regionCounter++;
            }

            regions.length = regionCounter;


            iRect = this._crosshairRenderer.settings.rect;
            iRect.right = width;
            iRect.bottom = bottom;
            this._crosshairRenderer.dimensions(iRect, leftAxisWidth, rightAxisWidth);
        },

        //#region user interaction

        hitTest: function (x, y) {
            var
                region = this.locateRegion(x, y),
                target,
                yScaleGroups,
                length,
                i2Target,
                i;

            if (region) {
                x -= this.settings.leftAxisWidth;

                if (region.type === regionTypes.series || region.type === regionTypes.header) {
                    target = this._upFrontTarget;

                    if (target) {
                        target = target.target.hitTest(x, y);

                        if (target) {
                            if (target.targetParent) {
                                //hot spot
                                target.targetParent.targetParent = this._upFrontTarget.targetParent;
                            } else {
                                // cold spot
                                target.targetParent = this._upFrontTarget.targetParent;
                            }

                        } else {
                            yScaleGroups = this.yScaleGroups();
                            length = yScaleGroups.length;

                            i2Target = this._upFrontTarget.target.settings.id;

                            for (i = 0; i < length; i++) {
                                target = yScaleGroups[i];

                                if (target.settings.id !== i2Target) {
                                    target = target.hitTest(x, y);

                                    if (target) {
                                        i2Target = target;

                                        while (i2Target.targetParent) {
                                            i2Target = i2Target.targetParent;
                                        }

                                        i2Target.targetParent = new EventTarget(this);
                                        break;
                                    }
                                }
                            }

                            if (i === length) {
                                target = new EventTarget(this);
                            }
                        }
                    } else {

                        yScaleGroups = this.yScaleGroups();
                        length = yScaleGroups.length;

                        for (i = 0; i < length; i++) {
                            target = yScaleGroups[i].hitTest(x, y);

                            if (target) {
                                i2Target = target;

                                while (i2Target.targetParent) {
                                    i2Target = i2Target.targetParent;
                                }

                                i2Target.targetParent = new EventTarget(this);
                                break;
                            }
                        }

                        if (i === length) {
                            target = new EventTarget(this);
                        }

                    }
                } else {
                    target = this._getTarget(region);
                }
            } else {
                target = new EventTarget(null, null);
            }

            return target;
        },

        locateRegion: function (x, y) {
            var
                regions = this._regions,
                iRect,
                length = regions.length,
                region;

            for (region = regions[0]; length; region = regions[--length]) {
                iRect = region.rect;
                if (iRect.left <= x && iRect.right >= x && iRect.top <= y && iRect.bottom >= y) {
                    return region;
                }
            }
            return null;
        },

        processPointer: function (pointer) {
            pointer.target = this._getTarget(pointer.region);
            if (pointer.region) {
                pointer.prices = this._getPrices(this.settings.yScaleGroups, pointer.offsetY);
            }
        },

        _getTarget: function (region) {
            var
                target = null,
                regionType = region.type;

            if (regionType === regionTypes.series || regionType === regionTypes.header) {
                target = new EventTarget(this);
            } else if (regionType === regionTypes.rightAxis) {
                target = new EventTarget(this.yScaleGroupRight.axis, new EventTarget(this.yScaleGroupRight, new EventTarget(this)));
            } else if (regionType === regionTypes.leftAxis) {
                target = new EventTarget(this.yScaleGroupLeft.axis, new EventTarget(this.yScaleGroupLeft, new EventTarget(this)));
            } else if (regionType === regionTypes.empty) {
                target = new EventTarget(null, new EventTarget(this));
            }

            return target;
        },

        _getPrices: function (yScaleGroups, y) {
            var
                length = yScaleGroups.length,
                prices = [],
                price,
                yScaleGroup;

            if (length) {
                do {
                    yScaleGroup = yScaleGroups[--length];
                    price = {};
                    price.value = yScaleGroup.scaler.inverse(y);
                    price.formattedValue = yScaleGroup.formatter(price.value);
                    prices[length] = price;

                } while (length);
            }
            return prices;
        },

        triggerGesture: function(type, data) {
            this._userInteraction.triggerGesture(type, data);
        },

        showCrosshair: function(x, y) {

            x += this.settings.leftAxisWidth;

            if (y === undefined) {
                this._crosshairRenderer.render(x);
            } else {

                var
                    leftAxisPrice = null,
                    rightAxisPrice = null;

                if (this.yScaleGroupLeft && this.yScaleGroupLeft.showLabels()) {
                    leftAxisPrice = this.yScaleGroupLeft.settings.formatter(this.yScaleGroupLeft.scaler().inverse(y));
                }

                if (this.yScaleGroupRight && this.yScaleGroupRight.showLabels()) {

                    rightAxisPrice = this.yScaleGroupRight.settings.formatter(this.yScaleGroupRight.scaler().inverse(y));
                }
                this._crosshairRenderer.render(x, y, leftAxisPrice, rightAxisPrice);
            }
        },

        hideCrosshair: function () {
            this._crosshairRenderer.clean();
        },

        yScaleGroupAxisPositionChange: function(yScaleGroupId, yScaleGroupAxisPosition) {
            var
                yScaleGroupRenderer = this.yScaleGroupsMap[yScaleGroupId].object,
                currentAxisPosition = yScaleGroupRenderer.axisPosition();

            if (currentAxisPosition === yAxisPosition.left) {
                this.yScaleGroupLeft = null;
            } else if (currentAxisPosition === yAxisPosition.right) {
                this.yScaleGroupRight = null;
            }

            yScaleGroupRenderer.axisPosition(yScaleGroupAxisPosition);

            if (yScaleGroupAxisPosition === yAxisPosition.left) {
                this.yScaleGroupLeft = yScaleGroupRenderer;
            } else if (yScaleGroupAxisPosition === yAxisPosition.right) {
                this.yScaleGroupRight = yScaleGroupRenderer;
            }
        },

        render: function(yScaleGroupId) {
            var
                yScaleGroupRenderer, yScaleGroups, length;

            if (yScaleGroupId) {
                this.yScaleGroupsMap[yScaleGroupId].object.render();
            } else {
                yScaleGroups = this.yScaleGroups();
                length = yScaleGroups.length;

                for (yScaleGroupRenderer = yScaleGroups[0]; length; yScaleGroupRenderer = yScaleGroups[--length]) {
                    yScaleGroupRenderer.render();
                }
            }
        },

        dispose: function () {
            this.rect = null;
            this.yScaleGroupLeft = null;
            this.yScaleGroupRight = null;
            this._upFrontTarget = null;
            this._regions = null;
            this.realEstatePercentage = null;
            this.headerDomElement = null;
            this.headerHeight = null;
            this.onHeaderRectChanged = null;
            this.yScaleGroups(null);
            this.yScaleGroupsMap = null;
            this.yScaleGroups = null;
            this._crosshairRenderer.dispose();
            this._crosshairRenderer = null;
            utilities.destroy(this.headerNode);
            utilities.destroy(this.domNode);
            this.headerNode = null;
            this.domNode = null;
            this.settings = null;
        }
    });
});

//<summary>
    //  settings:{
    //      id: @string,
    //      userInteractionType: @<userInteractionTypes>,
    //      realEstatePercentage: @number   // (%)
    //      yScaleGroups:[@<yScaleGroup>],
    //      indexedData: @Array, //reference
    //      painterFactory: @object, //reference
    //      leftAxisWidth : @number,
    //      rightAxisWidth : @number,
    //      rect: @object {
    //          top: @number,
    //          left: @number,
    //          bottom: @number,
    //          right: @number
    //      },
    //      minZOrder: @number,
    //      maxZOrder: @number,
    //      style:{
    //          header:{
    //              backgroundColor: 'css-color',
    //              borderBottom: '1px solid css-color',
    //          },
    //          crosshair: {
    //              draw: {
    //                  color: 'r, g, b',
    //                  width: @number (px)
    //              },
    //              indication: {
    //                  color: 'r, g, b',
    //                  font: @<css-font>
    //              }
    //          }
    //      },
    //      headerDomElement: undefined,
    //      onHeaderRectChanged: function(rect),
    //      headerHeight: @number
    //  }
    //</summary>
