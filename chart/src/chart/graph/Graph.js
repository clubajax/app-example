define([
    'dcl/dcl',
    'jquery',
    'common/Base',
    'common/Utilities',
    'common/Rect',
    '../group/GroupList',
    //'../group/YScaleGroupRenderer',
    '../axes/YAxisPosition',
    'common/RegionTypes',
    'common/EventTarget',
    '../userVisualFeedback/CrosshairRenderer'
], function (dcl, $, Base, utilities, rect, GroupList, /*YScaleGroupRenderer, */yAxisPosition, regionTypes, EventTarget, CrosshairRenderer) {

    var USEOLD = location.search.indexOf('old') > -1;

    function noop(){}
    
    return dcl(Base, {
        declaredClass:'Graph',
        constructor: function($parent, settings){
            
            var
                iRect,
                axisWidth = 0,
                crosshairZOrder = 100,
                labelAxisDistance = 12,
                labelBorderDistance = 2;

            this.settings = settings;
            this.eventTree = settings.eventTree;
            this.eventTree.setSource('graph', this);

            this.$parent = $($parent);
            this.id = settings.id || utilities.uid('graph');

            window[this.id] = this;
            console.log('Graph:', this.id);

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

            this.realEstatePercentage = utilities.settingProperty(settings, 'realEstatePercentage');

            this.headerNode = utilities.dom('div', {
                css:'subGraphHeader',
                html:settings.headerDomElement || settings.header ? settings.header.domElement : this.id,
                style:{
                    left:settings.leftAxisWidth//, zIndex: headerZOrder
                }
            }, this.domNode);

            if(!settings.header){
                settings.header = {
                    height: utilities.box(this.headerNode).height
                };
            }

            this.rect = utilities.settingProperty(settings, 'rect', function (value) {
                this._resize();
            }.bind(this));



            iRect = settings.rect;

            this.groups = this.list = new GroupList({
                
                eventTree: this.eventTree,
                leftAxisWidth: settings.leftAxisWidth,
                rightAxisWidth: settings.rightAxisWidth,
                indexedData: settings.indexedData,
                painterFactory: settings.painterFactory,
                headerHeight: settings.header.height,
                axisWidth: axisWidth,
                labelAxisDistance: labelAxisDistance,
                labelBorderDistance: labelBorderDistance,
                rect: rect(iRect.top, iRect.left, iRect.bottom, iRect.right),
                theme:settings.theme
            }, this.domNode);


            this.eventTree.on(this.eventTree.events.addGroup, this.addGroup, this);

            this.groups.add(settings.yScaleGroups || settings.axes);

            this._crosshairRenderer = new CrosshairRenderer(this.domNode, {
                rect: rect(),
                zOrder: crosshairZOrder,
                theme: settings.theme,
                leftAxisWidth: settings.leftAxisWidth,
                rightAxisWidth: settings.rightAxisWidth,
                labelAxisDistance: labelAxisDistance,
                labelBorderDistance: labelBorderDistance
            });

            this._resize();
        },

        addGroup: function (event) {

            var group = event.group;
            
            if (group.settings.axisPosition === yAxisPosition.left) {
                this.yScaleGroupLeft = group;
            } else if (group.settings.axisPosition === yAxisPosition.right) {
                this.yScaleGroupRight = group;
            }
            // TODO - remove backcompat .object
            group.object = group;
            this.yScaleGroupsMap[group.id] = group;
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

        getAllSeries: function(){
            console.log('get series for ', this.id);
            var i, series = [], groups = this.groups.get();
            for(i = 0; i < groups.length; i++){
                series = series.concat(groups[i].series.get());
            }
            return series;
        },

        dimensions: function (iRect, rightAxisWidth, leftAxisWidth) {
            this.settings.rect = iRect;
            this.axesWidth(rightAxisWidth, leftAxisWidth);
        },

        axesWidth: function (rightAxisWidth, leftAxisWidth) {

            this.leftAxisWidth = this.settings.leftAxisWidth = leftAxisWidth;
            this.rightAxisWidth = this.settings.rightAxisWidth = rightAxisWidth;
            if(this.groups){
                this.groups.axesWidth(rightAxisWidth, leftAxisWidth);
            }
            this._resize();
        },

        _resize: false ?

        function(){
            // NEW - NOT USED YET
            var
                iRect = this.rect(),
                leftAxisWidth = this.settings.leftAxisWidth,
                rightAxisWidth = this.settings.rightAxisWidth,
                headerSize = utilities.box(this.headerNode),
                top = iRect.top,
                bottom = iRect.bottom,
                height = bottom - top,
                width = this.$parent.width();

            utilities.style(this.domNode, {
                height:height,
                width:width,
                top:iRect.top
            });

            if (headerSize.width !== (width - rightAxisWidth - leftAxisWidth - 1)) {
                utilities.style(this.headerNode, 'width', width - rightAxisWidth - leftAxisWidth - 1);
            }
            utilities.style(this.headerNode, 'left', leftAxisWidth + 1);

            this.groups.dimensions(iRect, leftAxisWidth || rightAxisWidth, headerSize.height);
            
            this.groups._resize();
        } :
        function () {
            // OLD
            var
                settings = this.settings,
                yRect,
                hRect,
                rRect,
                iRect = settings.rect,
                top = iRect.top,
                regionCounter = 0,
                bottom = iRect.bottom,
                height = bottom - top,
                leftAxisWidth = settings.leftAxisWidth,
                rightAxisWidth = settings.rightAxisWidth,
                width = this.$parent.width(),
                yScaleGroupRenderers = this.groups.get(),
                length = yScaleGroupRenderers.length,
                headerHeight = settings.header.height,
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

                yRect = yScaleGroupRenderer.rect();

                yRect.top = 0;
                yRect.bottom = height;

                if (yScaleGroupRenderer.settings.axisPosition === yAxisPosition.left) {

                    yRect.left = 0;
                    yRect.right = width - rightAxisWidth;

                    yScaleGroupRenderer.dimensions(yRect, leftAxisWidth, headerHeight);

                } else if (yScaleGroupRenderer.settings.axisPosition === yAxisPosition.right) {

                    yRect.left = leftAxisWidth;
                    yRect.right = width;

                    yScaleGroupRenderer.dimensions(yRect, rightAxisWidth, headerHeight);

                } else {

                    yRect.left = leftAxisWidth;
                    yRect.right = width - rightAxisWidth;

                    yScaleGroupRenderer.changeRectAndHeaderHeight(yRect, headerHeight);
                }
            }

            if (settings.onHeaderRectChanged) {

                hRect = this._headerRect;

                if (hRect.left !== settings.leftAxisWidth || hRect.right !== settings.rightAxisWidth) {
                    hRect.left = settings.leftAxisWidth;
                    hRect.right = settings.rightAxisWidth;

                    settings.onHeaderRectChanged(hRect);
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
                rRect = region.rect;
                rRect.bottom = bottom;
                rRect.right = leftAxisWidth;

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
            rRect = region.rect;
            rRect.top = headerHeight;
            rRect.bottom = bottom;
            rRect.left = leftAxisWidth;
            rRect.right = width - rightAxisWidth;

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
            rRect = region.rect;
            rRect.top = 0;
            rRect.bottom = headerHeight;
            rRect.left = leftAxisWidth;
            rRect.right = width - rightAxisWidth;

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
                rRect = region.rect;
                rRect.bottom = bottom;
                rRect.left = width - rightAxisWidth;
                rRect.right = width;

                regionCounter++;
            }

            regions.length = regionCounter;


            rRect = this._crosshairRenderer.settings.rect;
            rRect.right = width;
            rRect.bottom = bottom;
            this._crosshairRenderer.dimensions(rRect, leftAxisWidth, rightAxisWidth);
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

                        yScaleGroups = this.groups.get();
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
                pointer.prices = this._getPrices(this.groups.get(), pointer.offsetY);
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
                    price.value = yScaleGroup.scaler().inverse(y);
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
                    leftAxisPrice = this.yScaleGroupLeft.formatter(this.yScaleGroupLeft.scaler().inverse(y));
                }

                if (this.yScaleGroupRight && this.yScaleGroupRight.showLabels()) {

                    rightAxisPrice = this.yScaleGroupRight.formatter(this.yScaleGroupRight.scaler().inverse(y));
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
            if(USEOLD){
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
            }else{
                this.groups.render(yScaleGroupId);
            }


        },

        dispose: function () {
            this.groups.dispose();
            this.rect = null;
            this.yScaleGroupLeft = null;
            this.yScaleGroupRight = null;
            this._upFrontTarget = null;
            this._regions = null;
            this.realEstatePercentage = null;
            this.headerDomElement = null;
            this.headerHeight = null;
            this.onHeaderRectChanged = null;
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
