define([
    'dcl/dcl',
    'common/Base',
    'common/Utilities',
    './SectionList',
    './data',
    'common/EventTarget'
], function (dcl, Base, utilities, SectionList, data, EventTarget) {


    var USEOLD = 0;
    
    function noop(){}
    
    function createSetter(object, name, value, dbg){
        var tmp = value;
        Object.defineProperty(object, name, {
            get: function() {
                if(dbg){
                    console.error('GET ', name, tmp);
                }
                return tmp;
            },
            set: function(val) {
                if(dbg){
                    console.error('SET ', name, val);
                }
                tmp = val;
            }
        });
    }

    return dcl(Base, {
        declaredClass:'Serie',

        eventTree: null,

        //scaler: null,
        //rect: null,
        //limits: null,
        indexedData: null,
        painterFactory: null,
        //serie: null,
        theme:null,

        id: utilities.uid('serie'),
        //inputs: null,
        //data: utilities.getValue(serie.data),
        //sections: null,
        definesScaling: null,

        //observables:{
        //    isSelected:false
        //},

        constructor: function(settings, node){

            var
                selected = false,
                self = this,
                length,
                rect = settings.rect,
                sections,
                serie = settings.serie,
                i;
                
            this.definesScaling = serie.definesScaling !== undefined ? serie.definesScaling :
                    (serie._settings && serie._settings.definesScaling !== undefined) ? serie._settings.definesScaling : true;

            //settings.sections = settings.sections || [];
            this.id = settings.id || utilities.uid('serie');

            this.eventTree.setSource('serie', this);

            console.log('Serie', this.id);
            window[this.id] = this;

            this.settings = settings;

            this.domNode = node;

            this.data = data({
                data:settings.serie.data,
                serie:this
            });

            this.isSelected = function(value){
                if(value !== undefined){
                    selected = value;
                    this.sections.isSelected(value);
                }
                return selected;
            };

            this.eventTree.on(settings.eventTree.events.selected, function(event){
                selected = event.section.isSelected();
            });

            this.rect = utilities.settingProperty(settings, 'rect', function () {
                this._resize();
            }.bind(this));

            this.scaler = utilities.settingProperty(settings, 'scaler', function (newValue) {
                var sectionRenderers = this.sections.get(),
                    length = sectionRenderers.length,
                    sectionRenderer;

                for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                    sectionRenderer.scaler(newValue);
                }
            }.bind(this));

            this.sectionsMap = {};

            this.sections = this.list =  new SectionList({
                eventTree: this.eventTree,
                scaler: settings.scaler,
                rect: rect,
                limits: settings.serie.limits,
                indexedData: settings.indexedData,
                painterFactory: settings.painterFactory,
                serie: settings.serie,
                theme:settings.theme
            }, this.domNode);
            this.sections.add(settings.serie.sections || settings.serie.layers);
            
            this._labels = [];

            if ((rect.right - rect.left) || rect.bottom - rect.top) {
                this._resize();
            }

            this.inputs = {
                get: function(){
                    return settings.serie.inputs;
                },
                update: function(inputs){
                    settings.serie.inputs = inputs;
                    this.render();
                }.bind(this)
            };
        },

        dimensions: function(iRect){
            this.rect(iRect);
        },

        _resize: function () {
            var
                sectionRenderers = this.sections.get(),
                length = sectionRenderers.length,
                rect = this.rect(),
                sectionRenderer;
            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.changeRect(rect);
            }
        },

        hitTest: function ( x, y) {
            var
                sections = this.sections.get(),
                length = sections.length,
                eventTarget;

            do {
                eventTarget = sections[--length].hitTest(x, y);

                if (eventTarget) {

                    if (eventTarget.targetParent) {
                        eventTarget.targetParent.targetParent = new EventTarget(this);
                    } else {
                        eventTarget.targetParent = new EventTarget(this);
                    }

                    return eventTarget;
                }
            } while (length);

            return null;

        },

        render: function () {
            var
                sectionRenderers = this.sections.get(),
                length = sectionRenderers.length,
                sectionRenderer;

            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.render();
            }
        },

        renderIndex: function (index) {
            var
                sectionRenderers = this.sections.get(),
                length = sectionRenderers.length,
                sectionRenderer;

            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.renderIndex(index);
            }
        },

        getLabelsForIndication: function () {
            var
                labels, i,
                sectionRenderers = this.sections.get(),
                length = sectionRenderers.length;

            if (length && this.settings.serie.data.length) {
                labels = sectionRenderers[0].getLabelsForIndication();

                for (i = 1; i < length; i++) {
                    labels.push.apply(labels, sectionRenderers[i].getLabelsForIndication());
                }

            } else {
                labels = null;
            }

            return labels;
        },

        dataInspect: function (index) {
            var
                sectionRenderers = this.sections.get(),
                length = sectionRenderers.length,
                result = {},
                data,
                dataPoint = this.settings.serie.data[index],
                i;

            result.timeStamp = dataPoint.timeStamp;
            result.values = dataPoint.values;
            result.layers = [];

            data = sectionRenderers[0].dataInspect(index);

            result.layers.push(data);

            for (i = 1; i < length; i++) {
                data = sectionRenderers[i].dataInspect(index);

                result.layers.push(data);
            }

            return result;
        },

        remove: function(){
            this.eventTree.emit(this.eventTree.events.removeSerie, this.id);
            this.dispose();
        },

        setTimeLimitsInRange: function (beginTimeStamp, endTimeStamp, combine) {
            var
                data = this.settings.serie.data,
                currentLimits = this.settings.serie.limits,
                timelimits, begin, beginIdx, end, endIdx;

            if (data.length) {
                if (combine && currentLimits && currentLimits.time) {
                    beginTimeStamp = beginTimeStamp < currentLimits.time.minValue ? beginTimeStamp : currentLimits.time.minValue;
                    endTimeStamp = endTimeStamp > currentLimits.time.maxValue ? endTimeStamp : currentLimits.time.maxValue;
                }
                begin = utilities.findCeilIndex(data, beginTimeStamp);
                beginIdx = begin;
                end = utilities.findFloorIndex(data, endTimeStamp);
                endIdx = end;

                if (beginIdx <= data.length - 1 && endIdx >= 0 && endIdx >= beginIdx) {
                    if (beginIdx < 0) {
                        beginIdx = 0;
                    }
                    if (endIdx >= data.length) {
                        endIdx = data.length - 1;
                    }
                    currentLimits = currentLimits || { time: {} };
                    currentLimits.time = currentLimits.time || {};
                    timelimits = currentLimits.time;
                    timelimits.minValueIndex = beginIdx;
                    timelimits.minValue = data[beginIdx].timeStamp;
                    timelimits.maxValue = data[endIdx].timeStamp;
                    timelimits.maxValueIndex = endIdx;
                    this.settings.serie.limits = currentLimits;

                    //console.log('limits after adding: ' + JSON.stringify(currentLimits, null, 2));
                } else {
                    // Ugh. this looks like a total bail out.
                    console.log('serie.settings.serie.limits = null;');
                    this.settings.serie.limits = null;
                    console.error('serie.limits set to null - fubar\'d attempt to calculate. Possibly due to mismatched data lengths');
                    // This problem appears to come from the timestamps falling out of range.
                    // In tests this problem seems to be created by adding data ranges that
                    // are not of the same length - or at least don't end at the same time.
                }
            } else {
                this.settings.serie.limits = null;
            }
        },

        removeTimeLimits: function (beginTimeStamp, endTimeStamp) {
            var
                begin,
                end,
                beginIndex,
                endIndex,
                data = this.settings.serie.data,
                timeLimits = this.settings.serie.limits && this.settings.serie.limits.time,
                isTrimOnLeft;

            if (timeLimits) {
                begin = utilities.findCeil(data, beginTimeStamp);
                end = utilities.findFloor(data, endTimeStamp);

                if (end.index >= begin.index && end.index >= 0) {

                    beginIndex = begin.found ? begin.index - 1 : begin.index;

                    endIndex = begin.found ? end.index + 1 : end.index;
                    if (beginIndex <= timeLimits.minValueIndex && endIndex >= timeLimits.maxValueIndex) {
                        this.settings.serie.limits = null;
                        return null;
                    }

                    if (beginIndex < 0) {
                        beginIndex = 0;
                    }

                    isTrimOnLeft = timeLimits.minValueIndex <= beginIndex;
                    timeLimits.minValueIndex = isTrimOnLeft ? endIndex : timeLimits.minValueIndex;
                    timeLimits.minValue = data[timeLimits.minValueIndex];
                    timeLimits.maxValueIndex = isTrimOnLeft ? timeLimits.maxValueIndex : beginIndex;
                    timeLimits.maxValue = isTrimOnLeft ? data[timeLimits.maxValueIndex].timeStamp : data[beginIndex].timeStamp;
                }
            }
            return timeLimits;
        },

        getValueLimits: function (paintablePoints, dataPoint, previousLimits) {
            var
                definesScaling = this.definesScaling,
                minValue, maxValue, dataValues = dataPoint.values, value,
                length = paintablePoints.length;

            if (definesScaling === undefined || definesScaling) {


                if (!previousLimits) {
                    minValue = Number.MAX_VALUE;
                    maxValue = Number.MIN_VALUE;
                    previousLimits = {
                        minValue: minValue,
                        maxValue: maxValue
                    };
                }

                maxValue = minValue = dataValues[paintablePoints[0]].value;

                length--;

                for (value = dataValues[paintablePoints[length]].value; length; value = dataValues[paintablePoints[--length]].value) {
                    if (value > maxValue) {
                        maxValue = value;
                    }

                    if (value < minValue) {
                        minValue = value;
                    }
                }

                previousLimits.minValue = minValue;
                previousLimits.maxValue = maxValue;

                return previousLimits;
            } else {
                return null;
            }
        },



        processValueLimits: function (beginIdx, endIdx, valueLimits) {
            var
                idx,
                paintablePoints = this.getPaintablePoints(),
                datapoint,
                data = this.settings.serie.data,
                dataLength = data ? data.length : 0,
                result = false;

            if (paintablePoints && paintablePoints.length) {
                this.calculateNewValueLimits(paintablePoints, data[beginIdx], beginIdx, valueLimits);
                for (idx = beginIdx + 1; idx <= endIdx && idx < dataLength; idx++) {
                    datapoint = data[idx];
                    this.calculateNewValueLimits(paintablePoints, datapoint, idx, valueLimits);
                }
                result = true;
            }
            return result;
        },

        getPaintablePoints: function () {
            var sections,
                sectionLength, i,
                datapointDefinition,
                dataPointDefinitions,
                dataPointLength, j,
                result = this._paintablePoints,
                key, resultMap;

            if (!result) {
                result = [];
                resultMap = {};
                sections = this.sections.get();
                sectionLength = sections.length;
                for (i = 0; i < sectionLength; i++) {
                    dataPointDefinitions = sections[i].dataPointDefinitions();
                    dataPointLength = dataPointDefinitions.length;
                    for (j = 0; j < dataPointLength; j++) {
                        datapointDefinition = dataPointDefinitions[j];
                        //if the datapoint definition is a value type (as opposed to text, bool, etc)
                        //TODO: REMEMBER THE COMMENT ABOVE!!!
                        if (datapointDefinition.isValue || datapointDefinition.isValue === undefined) {
                            key = datapointDefinition.key;
                            if (!resultMap[key]) {
                                resultMap[key] = datapointDefinition;
                                result.push(key);
                            }
                        }
                    }
                }
                this._paintablePoints = result;
            }
            return result;
        },

        temporaryValueLimits:null,
        calculateNewValueLimits: function(paintablePoints, datapoint, index, currentLimits){
            var
                limits =
                this.temporaryValueLimits = this.getValueLimits(paintablePoints, datapoint, this.temporaryValueLimits);

            if (limits.minValue < currentLimits.minValue) {
                currentLimits.minValueIndex = index;
                currentLimits.minValue = limits.minValue;
            }

            if (limits.maxValue > currentLimits.maxValue) {
                currentLimits.maxValueIndex = index;
                currentLimits.maxValue = limits.maxValue;
            }
        },

        dispose: function () {
            this.rect = null;
            this.scaler = null;
            this.sections.dispose();
            this.sections = null;
            this.sectionsMap = null;
            this._labels = null;
            this.settings = null;
        }
    });
});
