define([
    'dcl/dcl',
    'jquery',
    'localLib/Evented',
    'common/Utilities',
    '../common/AutoSnapObject'
], function(dcl, $, Evented, utilities, AutoSnapObject){

    var snapData = [];

    return dcl([AutoSnapObject, Evented], {

        declaredClass:'DrawingEditor',
        pluginName:'editor',

        constructor: function(settings){
            this.settings = settings || {};
            this.domNode = settings.domNode;
            this.targetEditingObject = null;
            this._currentCursor = 'default';
            this.autoSnapCallback = utilities.settingProperty(settings, 'autoSnapCallback');
            this.autoSnapSensibility = utilities.settingProperty(settings, 'autoSnapSensibility');
        },

        onMoveGesture: function (eventObject) {

            if (this.targetEditingObject && eventObject.pointers[0].region.type === 'series' && eventObject.pointers[0].graphIndex === this.targetEditingObject.graphIndex) {

                if (this.domNode && this._currentCursor !== 'pointer') {
                    this.domNode.style.cursor = 'pointer';
                    this._currentCursor = 'pointer';
                }

                var
                    chain = this.targetEditingObject,
                    serie = chain.serie,
                    inputs = serie.inputs.get(),
                    inputIndex = this.targetEditingObject.hotspotIndex,
                    settings,
                    currentAxis = chain.axis,
                    chart = eventObject.chart,
                    deltaPrice, deltaX, position, newAxis,
                    input, snapTo, price, length, timeStamp, series;

                if (inputIndex !== null) {
console.log('HOTSPOT', inputIndex, this.targetEditingObject);
                    input = inputs[inputIndex];

                    if (input.value.price !== null) {

                        this.computeSnapValues(
                            snapData,
                            eventObject.pointers[0].offsetX - eventObject.pointers[0].region.rect.left,
                            eventObject.pointers[0].offsetY,
                            //eventObject.pointers[0].graph.dataInspect(eventObject.pointers[0].timeStamp),
                            eventObject.chart.engine.dataInspect(eventObject.pointers[0].graph, eventObject.pointers[0].timeStamp),
                            eventObject.pointers[0].barSlotCenter,
                            this.autoSnapSensibility());

                        if (snapData.length) {

                            if (this.autoSnapCallback()) {

                                snapTo = this.autoSnapCallback()(snapData);

                                if (snapTo === true) {
                                    snapTo = snapData[0];
                                }
                            } else {
                                snapTo = snapData[0];
                            }

                            snapData.length = 0;
                        }

                        if (snapTo) {
                            newAxis = chain.graph.groups.get(snapTo.axisIndex);

                            input.value.price = snapTo.price;

                            if (chain.axisIndex !== snapTo.axisIndex) {

console.log('NONSENSE');
                                 //THIS DOESN"T MAKE SENSE

                                length = inputs.length;

                                do {
                                    if (inputIndex !== --length) {
                                        input = inputs[length];

                                        input.value.price = newAxis.scaler().inverse(currentAxis.scaler().calculate(input.value.price));
                                    }
                                } while (length);

                                //currentAxis.series.splice(chain.serieIndex, 1);
                                currentAxis.series.remove(chain.serieIndex);
                                //settings = serie.getSettings();
                                //settings.layers[snapTo.layerIndex].isSelected = true;

                                serie.sections.get(snapTo.layerIndex).isSelected(true);
                                
                                chain.axisIndex = snapTo.axisIndex;
                                chain.axis = newAxis;

                                chain.serie = null;
                                chain.layer = null;

                                series = chain.axis.series;

                                series.push(settings);

                                series = series();

                                chain.serieIndex = series.length - 1;
                                chain.serie = series[chain.serieIndex];

                                chain.layerIndex = snapTo.layerIndex;
                                chain.layer = chain.serie.layers()[chain.layerIndex];

                                return false;
                            }

                        } else {
                            input.value.price = eventObject.pointers[0].prices[chain.axisIndex].value;
                        }
                    }

                    if (input.value.timeStamp !== null) {
                        input.value.timeStamp = eventObject.pointers[0].timeStamp;
                    }

                } else {


console.log('LINE');
                    price = eventObject.pointers[0].prices[chain.axisIndex].value;
                    deltaPrice = price - chain.prices[chain.axisIndex].value;
                    deltaX = eventObject.pointers[0].barSlotCenter - chain.barSlotCenter;

                    length = inputs.length;

                    if (deltaX) {

                        position = chart.getPositionByTimeStamp(eventObject.pointers[0].timeStamp);

                        if (position.found) {
                            deltaX = position.index;

                            position = chart.getPositionByTimeStamp(chain.timeStamp);

                            if (position.found) {
                                deltaX -= position.index;
                            } else {
                                deltaX = 0;
                            }
                        } else {
                            deltaX = 0;
                        }
                    }

                    if (deltaX) {
                        chain.timeStamp = eventObject.pointers[0].timeStamp;
                        chain.barSlotCenter = eventObject.pointers[0].barSlotCenter;
                    }

                    do {
                        input = inputs[--length];

                        if (input.value.price) {
                            input.value.price += deltaPrice;
                        }

                        if (deltaX && input.value.timeStamp) {

                            position = chart.getPositionByTimeStamp(input.value.timeStamp);

                            if (position.found) {

                                timeStamp = chart.getTimeStampByPosition(position.index + deltaX);

                                if (timeStamp) {

                                    input.value.timeStamp = chart.getTimeStampByPosition(position.index + deltaX);
                                }
                            }
                        }

                    } while (length);

                    chain.prices[chain.axisIndex].value = price;
                }

                serie.inputs.update(inputs);

                return false;
            } else {
                return true;
            }
        },

        onLeaveGesture: function (eventObject) {
            if (this.targetEditingObject && eventObject.pointers[0].region.type === 'series') {

                if (this.domNode) {
                    this.domNode.style.cursor = 'default';
                    this._currentCursor = 'default';
                }
            }
        },

        onUpGesture: function (eventObject) {
            if (this.targetEditingObject) {
                this.emit('edit', {
                    serie:this.targetEditingObject.serie,
                    index:this.targetEditingObject.serieIndex
                });
                this.targetEditingObject = null;
                if (this.domNode) {
                    this.domNode.style.cursor = 'default';
                    this._currentCursor = 'default';
                }
            }

            return true;
        },

        onDownGesture: function (eventObject) {
console.log('editor.down');
            var targetObject, pointer = eventObject.pointers[0];
            if (pointer.target === 'graph' && pointer.region.type === 'series') {
console.log('    editor.graph');
                targetObject = eventObject.hitTest();
                if (targetObject.target === 'hotspot') {
console.log('        editor.hotspot');
                    this.targetEditingObject = this._createTargetEditingObject(targetObject, pointer.prices, pointer.timeStamp, pointer.barSlotCenter);

                    if (this.domNode) {
                        this.domNode.style.cursor = 'pointer';
                        this._currentCursor = 'pointer';
                    }

                    return !targetObject.layer.isSelected();
                }else{
                    console.log('targetObject.target', targetObject.target);
                }
            }

            return true;

        },

        triggerSetTargetEditingObject: function (eventObject) {
            var
                pointer = eventObject.pointers[0],
                targetObject;
            if (pointer.region.type === 'series') {
                //targetObject = pointer.graph.hitTest(pointer.barSlotCenter + pointer.region.rect.left, pointer.offsetY);
                targetObject = eventObject.hitTest(pointer.barSlotCenter + pointer.region.rect.left, pointer.offsetY);
                if (targetObject.target === 'hotspot') {
                    this.targetEditingObject = this._createTargetEditingObject(targetObject, pointer.prices, pointer.timeStamp, pointer.barSlotCenter);
                    return this.targetEditingObject;
                }
            }

            return null;
        },

        _createTargetEditingObject: function(targetObject, prices, timeStamp, barSlotCenter) {
            return $.extend(targetObject, { prices: prices, timeStamp: timeStamp, barSlotCenter: barSlotCenter });
        },

        onEventCallback: function (eventType, eventObject) {

            switch (eventType) {

                case "downGesture":
                    return this.onDownGesture(eventObject);
                case "upGesture":
                    return this.onUpGesture(eventObject);
                case "moveGesture":
                    return this.onMoveGesture(eventObject);
                case "leaveGesture":
                    return this.onLeaveGesture(eventObject);
                // wtf...
                //case "wheelGesture":
                    //return !this.object;
                default:
                    return true;
            }
        },

        dispose: function () {
            this.settings = null;
            this._currentCursor = null;
            this.targetEditingObject = null;
            this.autoSnapCallback = null;

            this.autoSnapSensibility = null;
        }
    });
});
