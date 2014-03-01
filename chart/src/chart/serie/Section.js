define([
    'dcl/dcl',
    'common/Base',
    '../seriePainters/SeriePainterFactory',
    'chart/printers/CanvasPrinter',
    'common/Rect',
    'common/EventTarget',
    'common/Utilities'
], function(dcl, Base, seriePainterFactory, CanvasPrinter, rect, EventTarget, utilities){


    function createSetter(object, name, value, dbg){
        var tmp = value;
        Object.defineProperty(object, name, {
            get: function() {
                if(dbg){
                    console.error('GET ', name);
                }
                return tmp;
            },
            set: function(val) {
                if(dbg){
                    console.error('SET ', name);
                }
                tmp = val;
            }
        });
    }

    var Proto = {
        declaredClass:'Section',

        chartType: null,
        //dataPointDefinitions: null,
        id: null,
        //isSelected: null,
        style: null,

        eventTree: null,
        scaler: null,
        //rect: null,
        limits: null,
        indexedData: null,
        painterFactory: null,
        serie: null,
        theme: null,

        observables:{
            isSelected:false,
            //scaler:null,
            //rect:null,
            dataPointDefinitions:null

        },

        preMixProperties: function(options){
            var
                layer = options.serie.sections ? options.serie.sections[0] : options.serie.layers[0],
                result,
                sectionDatapointDefinitions = [],
                layerDataPointDefintion,
                validator = [],
                indicationNumber, formatter, length, i,
                layerDataPointDefinitions;


            layerDataPointDefinitions = layer.chartType.dataPointDefinitions;

            if (layerDataPointDefinitions) {
                length = layerDataPointDefinitions.length;

                for (i = 0; i < length; i++) {
                    layerDataPointDefintion = layerDataPointDefinitions[i];
                    indicationNumber = layerDataPointDefintion.indication;
                    if (layerDataPointDefintion.indication && indicationNumber >= 0) {
                        if (indicationNumber === true) {
                            indicationNumber = i;
                        }
                        if (validator[indicationNumber]) {
                            throw new Error('duplicated indication order: ' + indicationNumber);
                        } else {
                            validator[indicationNumber] = indicationNumber;
                        }
                    } else {
                        indicationNumber = undefined;
                    }
                    formatter = layerDataPointDefintion.numberFormat ? utilities.getFormatter(layerDataPointDefintion.numberFormat) : layerDataPointDefintion.numberFormat;
                    sectionDatapointDefinitions.push({
                        key: layerDataPointDefintion.key,
                        indication: indicationNumber,
                        formatter: formatter
                    });
                }
            }

            result = {
                id: layer.id || utilities.uid('section'),
                isSelected: layer.isSelected,
                dataPointDefinitions: sectionDatapointDefinitions,
                chartType: layer.chartType.name,
                style: layer.chartType.settings || layer._settings.chartType.settings,
                theme:options.theme,
                indexedData: options.indexedData,
                eventTree: options.eventTree,
                scaler: options.scaler,
                rect: options.rect,
                limits: options.limits,
                painterFactory: options.painterFactory
            };

            if (layer._settings) {
                if(!result.chartType && layer._settings.chartType){
                    // fix for some comlpicated, unknown problem
                    result.chartType = layer._settings.chartType.name;
                }
            }
            return result;
        },

        constructor: function(settings, node) {

            createSetter(this, 'rect', settings.rect);
            createSetter(settings, 'rect', settings.rect, true);

            this.settings = settings;

            //this.id = settings.id;
            this.eventTree = settings.eventTree;
            this.eventTree.setSource('section', this);
            this._physicalRect = rect();
            this._labelsForIndication = [];

            console.log('Section', this.id);
            window[this.id] = this;

            this.domNode = utilities.dom('div', {
                css:'chartSection'
            }, node);

            //this.scaler.subscribe(function(value) {
            //    this.painter.scaler(value);
            //},this);

            this.dataPointDefinitions.subscribe(function(value) {
                this._processDataPointDefinitions(value);
            },this);

            //console.log('this.dataPointDefinitions', this.dataPointDefinitions());

            //this.rect.subscribe(function() {
            //    this._resize();
            //    this.painter.rect(this.settings.rect);
            //},this);
            //
            //this.rect.subscribe(function(value){
            //    settings.rect = value;
            //});
            
            this.isSelected.subscribe(function(value){
                this.painter.isSelected(value);
                this.eventTree.emit(settings.eventTree.events.selected, {section:this});
                this.render();
            }, this);



            //console.log('OBSERVING', this.settings.rect);
            //Object.observe(this.settings, function(value){
            //    console.log('-------CHANGE SETTINGS', value[0]);
            //});
            //
            //console.log('OBSERVING', this.settings.rect);
            //Object.observe(this.settings.rect, function(value){
            //    console.log('-------SOMETHING CHANGE RECT', value[0]);
            //});
            

            this.printer = new CanvasPrinter(this.domNode, {
                physicalRect: this._physicalRect,
                rect: this.rect
            });

            this._valueIndexes = [];
            this._labelDefinitions = [];

            this._processDataPointDefinitions(this.dataPointDefinitions());

            this.painter = this._createPainter();

            // do we need to check that there is a size?
            this._resize();

            console.log('section limits', this.settings.limits);

        },

        changeRect: function(iRect, scaler) {
            this.rect = iRect;
            if(scaler){
                this.scaler = scaler;
            }
            this._resize();
        },

        _resize: function() {

            var
                box = utilities.box(this.domNode.parentNode),
                physicalRect = this._physicalRect;

            physicalRect.right = box.width;
            physicalRect.bottom = box.height;

            utilities.style(this.domNode, {
                width:physicalRect.right,
                height: physicalRect.bottom
            });

            //console.log('physicalRect', physicalRect);
            //console.log('rect', this.settings.rect);

            this.printer.settings.rect = this.rect;
            this.printer.settings.physicalRect = physicalRect;

            this.painter.settings.rect = this.rect;

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
                    console.log('HOTSPOT', hotSpot);
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

            this.chartType = chartType;
            this.style = style;
            this.dataPointDefinitions(dataPointDefinitions);
            this.painter = this._createPainter();
            this.painter.valueIndexes(this._valueIndexes);
            this.eventTree.emit(this.eventTree.events.chartType, {section:this});
        },

        changeZOrder: function(zOrder) {
            utilities.style(this.domNode, 'z-index', zOrder);
        },

        render: function() {
            this.hotSpots = this.painter.render();
        },

        renderIndex: function(index) {
            this.painter.renderIndex(index);
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
                dataPointDefinitions = this.dataPointDefinitions(),
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
                this.chartType, {
                    printer: this.printer,
                    scaler: this.scaler,
                    isSelected: this.isSelected(),
                    indexedData: this.indexedData,
                    serie: settings.serie,
                    valueIndexes: this._valueIndexes,
                    rect: this.rect,
                    theme: this.theme,
                    style:this.style
                });
        },

        _processDataPointDefinitions: function(dataPointDefinitions) {

            var valueIndexes = this._valueIndexes,
                labelDefinitions = this._labelDefinitions,
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
        },

        dispose: function() {
            this.style = null;
            this.chartType = null;
            this.scaler = null;
            this.dataPointDefinitions = null;
            this.rect = null;





            // This is not bubbling up to Chart._selectedSerie
            this.isSelected = null;






               

            this._valueIndexes = null;
            this._labelDefinitions = null;
            this.painter.dispose();
            this.painter = null;
            this.printer.dispose();
            this.printer = null;
            utilities.destroy(this.domNode);
            this.settings = null;
        }
    };



    return dcl(Base, Proto);
});
