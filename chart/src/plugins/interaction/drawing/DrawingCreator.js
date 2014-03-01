define([
    'dcl/dcl',
    'jquery',
    'knockout',
    'localLib/Evented',
    'common/Utilities',
    '../common/AutoSnapObject',
    'common/ChartTypes',
    './DrawingEditor'
], function(dcl, $, ko, Evented, utilities, AutoSnapObject, chartTypes, DrawingEditor){
    
    var
        currentSerie,
        snapData = [];

    return dcl([AutoSnapObject, Evented], {
        declaredClass:'DrawingCreator',
        pluginName:'drawing',
        constructor: function(settings){
            this.settings = settings || {};

            this.domNode = this.settings.node || this.settings.$domElement;

            var
                additionAtPoint,
                drawingTemplate;

            this.template = function(value){
                if(value){
                    drawingTemplate = {
                        inputs: [],
                        definesScaling: false,
                        data: [],
                        layers: []
                    };

                    var
                        i,
                        inputAmount = value.inputAmount;

                    for(i = 1; i <= inputAmount; i++){
                        drawingTemplate.inputs.push({
                            name:'input' + i,
                            value:{
                                price: null,
                                timeStamp:null
                            }
                        });
                    }

                    if(value.layers){
                        for(i = 0; i < value.layers.length; i++ ){
                            drawingTemplate.layers.push(utilities.mixin(true, {}, value.layers[i]));
                        }
                    }else{
                        drawingTemplate.layers.push({
                            isSelected: false,
                            chartType: {
                                name: chartTypes.trendLine,
                                settings: {
                                    lineStyle:'orange'
                                }
                            }
                        });
                    }
                    this.active(true);
                }else if(value !== undefined){
                    drawingTemplate = null;
                    this.active(false);
                }
                return drawingTemplate;
            };

            this.beforeAddCallback = function(eventObject){
                additionAtPoint = eventObject;
                // need to return true in order for afterAddCallback to fire
                return true;
            };

            this.afterAddCallback = function(serie, index) {
                if (additionAtPoint) {
                    this.editor.triggerSetTargetEditingObject(additionAtPoint);
                    additionAtPoint = null;
                }
            };

            this.defaultAxisIndex = 0;
            this._currentCursor = 'default';

            this.active = ko.observable(settings.active || settings.isActive);
            this.isPersistent = ko.observable(settings.isPersistent);
            this.autoSnapCallback = ko.observable(settings.autoSnapCallback);
            this.autoSnapSensibility = ko.observable(settings.autoSnapSensibility);

            if(settings.objectSettingsTemplate){
                console.warn('Using removed drawing property, "objectSettingsTemplate"');
            }else if(settings.drawingTemplate){
                this.template(settings.drawingTemplate);
            }

            this.active.subscribe(function(value){
                this.onEventCallback = utilities.eventDelegation(value);
                this.emit('active', value);
            }, this);
            this.active.valueHasMutated();

            this.addEditor();

        },

        addEditor: function(){
            this.editor = new DrawingEditor({
                domNode: this.domNode,
                autoSnapCallback: function (snapTos) {
                    var snapTo = null, length = snapTos.length, index = null, i, shortestDistance = Number.MAX_VALUE, distance;
                    for (i = 0; i < length; i++) {
                        snapTo = snapTos[i];
                        distance = Math.sqrt(Math.pow(snapTo.distanceX, 2) + Math.pow(snapTo.distanceY, 2));
                        if (shortestDistance > distance) {
                            index = i;
                            shortestDistance = distance;
                        }
                    }
                    return index === null ? false : snapTos[index];
                }
            });

            this.editor.on('edit', function(obj){
                if(currentSerie){
                    this.emit('new', obj.serie);
                }else{
                    this.emit('edit', obj.serie);
                }

                // don't do this if persistent
                this.active(false);
            }, this);

            // Editor needs to be before Creator, or else
            // we will always draw and never edit
            this.settings.broker.add(this.editor);

        },

        createDrawingtemplate: function(){

        },
        
        onMoveGesture: function (eventObject) {
            if (this.active() && this.settings.$domElement && this._currentCursor !== 'crosshair') {
                //this.settings.$domElement.css('cursor', 'crosshair');
                this.domNode.style.cursor = 'crosshair';
                this._currentCursor = 'crosshair';
            }
            return true;
        },

        onLeaveGesture: function (eventObject) {
            if (this.active() && this.settings.$domElement && eventObject.pointers[0].region.type === 'series') {
                //this.settings.$domElement.css('cursor', 'default');
                this.domNode.style.cursor = 'default';
                this._currentCursor = 'default';
            }

            return true;
        },


        onUpGesture: function (eventObject) {
            if(currentSerie){
                currentSerie = null;
            }
        },

        onDownGesture: function (eventObject) {
            var
                template,
                axis,
                series,
                serie,
                i,
                index,
                length,
                inputs,
                input,
                timeStamp,
                axisIndex,
                price,
                pointer,
                isAdd;
                console.log('DRAw DOWN', eventObject);
            pointer = eventObject.pointers[0];

            if (this.active() && this.template() && pointer.region.type === 'series') {

                //template = utilities.mixin(true, {}, this.drawingTemplate);
                //settings = $.extend(true, {}, this.objectSettingsTemplate());
                template = utilities.mixin(true, {}, this.template());

                this.computeSnapValues(
                    snapData,
                    pointer.offsetX - pointer.region.rect.left,
                    pointer.offsetY,
                    eventObject.chart.engine.dataInspect(pointer.graph, pointer.timeStamp),
                    pointer.barSlotCenter,
                    this.autoSnapSensibility());

                if (snapData.length) {
                    if (this.autoSnapCallback()) {
                        axisIndex = this.autoSnapCallback()(snapData);
                        if (!axisIndex) {
                            axisIndex = this.defaultAxisIndex;
                        } else {
                            axisIndex = axisIndex.axisIndex;
                        }
                    } else {
                        axisIndex = snapData[0].axisIndex;
                    }
                } else {
                    axisIndex = this.defaultAxisIndex;
                }

                axis = pointer.graph.groups.get(axisIndex);

                inputs = template.inputs;

                length = inputs.length;

                timeStamp = pointer.timeStamp;
                price = pointer.prices[axisIndex].value;

                for (i = 0; i < length; i++) {
                    input = inputs[i];
                    input.value = input.value || {};
                    input.value.timeStamp = timeStamp;
                    input.value.price = price;
                }


                isAdd = this.beforeAddCallback(eventObject, template);
                if (isAdd) {
                    //add the serie

                    serie = eventObject.chart.addSerie(pointer.graph.id, axis.id, template, 1);

                    //series = axis.series;
                    //section = eventObject.chart.engine.getSerieSettings(template);
                    //serie = series.add(section);
                    //index = series.push(template);
                    //series = series();
                    //serie = series[series.length - 1];
                }

                serie.sections.get(0).isSelected(true);
                currentSerie = serie;
                this.afterAddCallback(serie, index);

                if (!this.isPersistent()) {

                    if (this.domNode) {
                        this.domNode.style.cursor = 'default';
                        this._currentCursor = 'default';
                    }

                }

                snapData.length = 0;
console.log('CREATED');

                return false;
            }



            return true;
        },



        dispose: function () {
            this.settings = null;
            this._currentCursor = null;
            this.active = null;
            this.isPersistent = null;
            this.defaultAxisIndex = null;
            this.objectSettingsTemplate = null;
            this.beforeAddCallback = null;
            this.afterAddCallback = null;
        }
    });
});
