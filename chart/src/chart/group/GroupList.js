define([
    'dcl/dcl',
    './Group',
    '../axes/YAxisPosition',
    'common/Base',
    'common/Utilities',
    'common/Rect',
    'common/RegionTypes',
    'common/EventTarget'
], function(dcl, Group, yAxisPosition, Base, utilities, rect, regionTypes, EventTarget){

    return dcl(Base, {
        declaredClass:'GroupList',

        eventTree:null,
        initialGroups:null,
        indexedData: null,
        painterFactory: null,
        headerHeight: 0,
        axisWidth: 0,
        labelAxisDistance: 0,
        labelBorderDistance: 0,
        leftAxisWidth:0,
        rightAxisWidth:0,
        rect: null,
        theme:null,

        constructor: function(settings, node){
            this.domNode = node;
            this.list = [];
            this.map = {};
            this._regions = [];


            //if(this.initialGroups){
            //    this.initialGroups = Array.isArray(this.initialGroups) ? this.initialGroups : [this.initialGroups];
            //    this.initialGroups.forEach(this.add, this);
            //}
        },

        getSerie: function(serieId){
            var i, serie;
            for(i = 0; i < this.list.length; i++){
                // transforms from removeSerie to removeSection.... UGH
                serie = this.list[i].series.getSection(serieId);
                if(serie){
                    return serie;
                }
            }
            return null;
        },

        removeSerie: function(serieId){
            var i, serie;
            for(i = 0; i < this.list.length; i++){
                serie = this.list[i].series.getSection(serieId);
                if(serie){
                    this.list[i].series.removeSection(serieId);
                    return true;
                }
            }
            return false;
        },

        add: function(objectSetting){
            if(!objectSetting){ return null; }
            if(Array.isArray(objectSetting)){
                objectSetting.forEach(this.add, this);
                return null;
            }
            var
                group,
                axisWidth = 0,
                iRect = this.rect;

            if (objectSetting.axisPosition === yAxisPosition.left) {
                axisWidth = this.leftAxisWidth;
            } else if (objectSetting.axisPosition === yAxisPosition.right) {
                axisWidth = this.rightAxisWidth;
            }

            group = new Group(utilities.mixin(objectSetting, {
                eventTree: this.eventTree.child(),
                indexedData: this.indexedData,
                painterFactory: this.painterFactory,
                headerHeight: this.headerHeight,
                axisWidth: axisWidth,
                labelAxisDistance: this.labelAxisDistance,
                labelBorderDistance: this.labelBorderDistance,
                rect: rect(iRect.top, iRect.left, iRect.bottom, iRect.right),
                isSelectionChangeCallback: this.isSelectionChangeCallback.bind(this),
                theme:this.theme
            }), this.domNode);

            if (objectSetting.axisPosition === yAxisPosition.left) {
                this.yScaleGroupLeft = group;
            } else if (objectSetting.axisPosition === yAxisPosition.right) {
                this.yScaleGroupRight = group;
            }

            this._serieZOrder += 1;//yScaleGroupzOrderSlotSize;

            this.list.push(group);
            this.map[group.id] = group;
            
            this.eventTree.emit(this.eventTree.events.addGroup, {group:group});

            return group;
        },

        axesWidth: function (rightAxisWidth, leftAxisWidth) {
            this.leftAxisWidth = leftAxisWidth;
            this.rightAxisWidth = rightAxisWidth;
        },

        dimensions: function (iRect, axisWidth, headerHeight) {
            this.rect = iRect;
            this.axisWidth = axisWidth;
            this.headerHeight = headerHeight;
            for(var i = 0; i < this.list.length; i++){
                this.list[i].dimensions(iRect, axisWidth, headerHeight);
            }
        },

        render: function(id) {
            var i;

            if (id) {
                this.get(id).render();
            } else {
                for(i = 0; i < this.list.length; i++){
                    this.list[i].render();
                }
            }
        },

        XX_resize: function () {

            var
                yRect,
                hRect,
                rRect,
                iRect = this.rect,
                top = iRect.top,
                regionCounter = 0,
                bottom = iRect.bottom,
                height = bottom - top,
                leftAxisWidth = this.leftAxisWidth,
                rightAxisWidth = this.rightAxisWidth || 50,
                width = utilities.box(this.domNode).width,
                yScaleGroupRenderers = this.list,
                length = yScaleGroupRenderers.length,
                regions = this._regions,
                headerHeight = this.headerHeight,
                yScaleGroupRenderer, region;

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

        isSelectionChangeCallback: function(){
            // stub
        }
    });
});
