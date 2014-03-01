define([
    'dcl/dcl',
    'common/Utilities',
    '../seriePainters/SeriePainterFactory',
    'chart/printers/CanvasPrinter',
    'common/Rect',
    'common/EventTarget'
], function(dcl, utilities, seriePainterFactory, CanvasPrinter, rect, EventTarget){

    return dcl(null, {
        declaredClass:'SerieSectionRenderer',
        constructor: function($parent, settings) {

            this.settings = settings;
            this.$parent = $parent;
            this.id = settings.id;
            this._physicalRect = rect();
            this._labelsForIndication = [];

            this.domNode = utilities.dom('div', {
                css:'section',
                style:{
                    position:'absolute',
                    top:0,
                    left:0,
                    zIndex: settings.zOrder
                }
            }, $parent);

            this.style = utilities.settingProperty(settings, 'style', function(style) {
                this.painter.style(style);
                this.painter.render();
            }.bind(this));

            this.chartType = utilities.settingProperty(settings, 'chartType', function(chartType) {
                this.painter.dispose();
                this.painter = this._createPainter(chartType);
            }.bind(this));

            this.scaler = utilities.settingProperty(settings, 'scaler', function(scaler) {
                this.painter.scaler(scaler);
            }.bind(this));

            this.dataPointDefinitions = utilities.settingProperty(settings, 'dataPointDefinitions', function() {
                this._processDataPointDefinitions();
                this.painter.valueIndexes(this._valueIndexes);
            }.bind(this));

            this.rect = utilities.settingProperty(settings, 'rect', function() {
                this._resize();
                this.painter.rect(this.settings.rect);
            }.bind(this));

            this.isSelected = utilities.settingProperty(settings, 'isSelected', function(nIsSelected) {
                this.painter.isSelected(nIsSelected);
                settings.isSelectionChangeCallback(new EventTarget(this), nIsSelected);
                this.render();
            }.bind(this));


            this.printer = new CanvasPrinter(this.domNode, {
                physicalRect: this._physicalRect,
                rect: settings.rect,
                cssText: "background-color: transparent; position:absolute;"
            });

            this._valueIndexes = [];
            this._labelDefinitions = [];

            this._processDataPointDefinitions();

            this.painter = this._createPainter();

            var iRect = settings.rect;

            if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                this._resize();
            }

        },

        _resize: function() {

            var
                box = utilities.box(this.$parent),
                physicalRect = this._physicalRect;

            physicalRect.right = box.width;
            physicalRect.bottom = box.height;

            utilities.style(this.domNode, {
                width:physicalRect.right,
                height: physicalRect.bottom
            });

            this.printer.settings.rect = this.settings.rect;
            this.printer.settings.physicalRect = physicalRect;

            this.printer.changeRect();

        },

        hitTest: function(x, y) {

            var
                hotSpot,
                hit = this.printer.hitTest(x, y, 0);

            if (hit) {

                hotSpot = null;

                if (this.hotSpots) {
                    hotSpot = this.painter.hitHotSpotTest(x, y, hit, this.hotSpots);
                }

                if(hotSpot){
                    return new EventTarget(hotSpot,  new EventTarget(this));
                } else {
                    return new EventTarget(this);
                }

            } else {
                return null;
            }
        },

        changeChart: function(chartType, style, dataPointDefinitions) {
            this.painter.dispose();

            var settings = this.settings;
            settings.chartType = chartType;
            settings.theme = style;
            settings.dataPointDefinitions = dataPointDefinitions;
            this._processDataPointDefinitions();
            this.painter = this._createPainter();
            this.painter.valueIndexes(this._valueIndexes);
        },

        changeZOrder: function(zOrder) {
            utilities.style(this.domNode, 'z-index', zOrder);
        },

        changeRect: function(iRect, scaler) {
            var settings = this.settings;
            settings.rect = iRect;
            this._resize();
            settings.scaler = scaler;
            this.painter.changeRect(iRect, scaler);
        },

        render: function() {
            this.hotSpots = this.painter.render();
        },

        renderIndex: function(index) {

            this.painter.renderIndex(index);
        },

        dispose: function() {

            this.style = null;
            this.chartType = null;
            this.scaler = null;
            this.dataPointDefinitions = null;
            this.rect = null;
            this.isSelected = null;
            this._valueIndexes.length = 0;
            this._labelDefinitions.length = 0;
            this.painter.dispose();
            this.painter = null;
            this.printer.dispose();
            this.printer = null;
            utilities.destroy(this.domNode);
            this.settings = null;
        },

        getLabelsForIndication: function() {

            var serie = this.settings.serie,
                indicationStyle = this.settings.theme.indication,
                labelDefinitions = this._labelDefinitions,
                labels = this._labelsForIndication,
                length = labelDefinitions.length,
                painter = this.painter,
                dataIndex = serie.data.length - 1,
                label, i;
                
            labels.length = 0;
            if (dataIndex > -1) {

                for (i = 0; i < length; i++) {
                    label = painter.preRender(dataIndex, labelDefinitions[i].key);
                    label.color = 'rgba(' + label.color + ',' + 0.5 + ')';
                    label.formatter = labelDefinitions[i].formatter;
                    label.fontColor =  'rgba(' + (label.fontColor || indicationStyle.fontColor) + ', 1)';
                    labels.push(label);
                }
            }



            return labels;
        },

        dataInspect: function(index) {
            var painter = this.painter,
                scaler = this.settings.scaler,
                dataPointDefinitions = this.settings.dataPointDefinitions,
                length = dataPointDefinitions.length, datas = [], i, data, dataPointDefinition;

            for (i = 0; i < length; i++) {

                dataPointDefinition = dataPointDefinitions[i];

                data = painter.preRender(index, dataPointDefinition.key);
                data.color = 'rgba(' + data.color + ',1)';
                data.key = dataPointDefinition.key;

                data.y = scaler.calculate(data.value);

                if (dataPointDefinition.formatter) {
                    data.formattedValue = dataPointDefinition.formatter(data.value);
                }

                datas.push(data);
            }

            return datas;
        },

        _createPainter: function() {

            var settings = this.settings;
            return seriePainterFactory.create(
                settings.chartType, {
                    printer: this.printer,
                    scaler: settings.scaler,
                    isSelected: settings.isSelected,
                    indexedData: settings.indexedData,
                    serie: settings.serie,
                    valueIndexes: this._valueIndexes,
                    rect: settings.rect,
                    theme: settings.theme,
                    style:settings.style
                });
        },

        _processDataPointDefinitions: function() {

            var valueIndexes = this._valueIndexes,
                labelDefinitions = this._labelDefinitions,
                dataPointDefinitions = this.settings.dataPointDefinitions,
                length = dataPointDefinitions.length,
                dataPointDefinition, i;

            valueIndexes.length = 0;
            labelDefinitions.length = 0;

            for (i = 0; i < length; i++) {

                dataPointDefinition = dataPointDefinitions[i];

                valueIndexes.push(dataPointDefinition.key);

                if (dataPointDefinition.indication > -1) {
                    labelDefinitions.push({
                        key: dataPointDefinition.key,
                        formatter: dataPointDefinition.formatter
                    });
                }
            }

            if (labelDefinitions.length > 1) {
                labelDefinitions.sort(this._labelAscendingSort);
            }

        },

        _labelAscendingSort: function(a, b) {
            return a.indication - b.indication;
        }
    });
});
